import React, { useEffect, useState } from 'react';
import { ScrollView, TouchableOpacity, Text, StyleSheet, Dimensions, Modal, FlatList, ActivityIndicator, View, TextInput } from 'react-native'; // Importado TextInput
import { VStack, NativeBaseProvider, HStack } from 'native-base';
import { pegarDados, pegarNomeDasMaquinas } from '../servicos/dadosServicos';
import CardMonitoramento from '../components/CardMonitoramento';

//import CardMonitoramento from './components/CardMonitoramentoOld'; // Linha comentada do seu código original

const screenWidth = Dimensions.get('window').width;
const cardWidth = screenWidth * 0.42;

const App = () => {
    // Estado para armazenar os dados detalhados dos cards exibidos
    const [cards, setCards] = useState([]);
    // Estado para armazenar os aliases (nomes) das máquinas que estão sendo exibidas como cards
    const [maquinasExibidas, setMaquinasExibidas] = useState([]);
    // Estado para armazenar a lista completa de todas as máquinas disponíveis (nome e última modificação)
    const [allKnownMachines, setAllKnownMachines] = useState([]);
    // Estado para armazenar as máquinas que estão disponíveis para serem adicionadas (filtradas de allKnownMachines)
    const [maquinasDisponiveis, setMaquinasDisponiveis] = useState([]);
    // Estado para controlar a visibilidade do modal de seleção de máquinas
    const [modalVisible, setModalVisible] = useState(false);
    // Estado para indicar se os dados iniciais estão sendo carregados
    const [loadingInitialData, setLoadingInitialData] = useState(true);
    // Estado para armazenar mensagens de erro globais
    const [errorMessage, setErrorMessage] = useState(null);
    // Estado para o texto da busca no modal
    const [searchText, setSearchText] = useState('');
    // Estado para as máquinas filtradas pela busca
    const [filteredMaquinas, setFilteredMaquinas] = useState([]);


    /**
     * @description Busca a lista completa de máquinas disponíveis da API (seu endpoint Node.js)
     * e filtra as que já estão sendo exibidas. Atualiza `allKnownMachines` e `maquinasDisponiveis`.
     */
    const fetchMaquinasDisponiveis = async () => {
        console.log("--- Iniciando fetchMaquinasDisponiveis ---");
        try {
            const resultado = await pegarNomeDasMaquinas(); // Assume que retorna { machineAliases: [{ name, lastModified }] }
            console.log("Resultado da API (pegarNomeDasMaquinas):", JSON.stringify(resultado, null, 2));
            if (resultado && resultado.machineAliases && Array.isArray(resultado.machineAliases)) {
                // Armazena a lista completa de todas as máquinas conhecidas com seus detalhes
                setAllKnownMachines(resultado.machineAliases);
                console.log("Todas as máquinas conhecidas (allKnownMachines):", resultado.machineAliases.length, "máquinas.");
                // Filtra as máquinas que ainda não estão sendo exibidas na tela principal
                console.log("Máquinas atualmente exibidas (maquinasExibidas):", maquinasExibidas);
                const maquinasFiltradas = resultado.machineAliases.filter(
                    (maquina) => {
                        const isExibida = maquinasExibidas.includes(maquina.name);
                        // console.log(`Verificando '${maquina.name}': Exibida? ${isExibida}`); // Log detalhado do filtro
                        return !isExibida;
                    }
                );
                setMaquinasDisponiveis(maquinasFiltradas);
                setFilteredMaquinas(maquinasFiltradas); // Inicializa a lista filtrada
                console.log("Máquinas disponíveis após filtro (maquinasDisponiveis):", maquinasFiltradas.length, "máquinas.");
            } else {
                console.warn("Resposta inesperada de 'pegarNomeDasMaquinas':", resultado);
                setAllKnownMachines([]);
                setMaquinasDisponiveis([]);
                setFilteredMaquinas([]);
            }
        } catch (error) {
            console.error("Erro ao buscar máquinas disponíveis:", error);
            setErrorMessage("Erro ao carregar lista de máquinas disponíveis.");
            setAllKnownMachines([]);
            setMaquinasDisponiveis([]);
            setFilteredMaquinas([]);
        } finally {
            setLoadingInitialData(false); // Marca que o carregamento inicial terminou
            console.log("--- fetchMaquinasDisponiveis Concluído ---");
        }
    };

    /**
     * @description Busca os dados detalhados (incluindo históricos para gráficos)
     * para cada máquina em `maquinasExibidas` e atualiza os cards na UI.
     */
    const fetchExibirMaquinas = async () => {
        // Se não há máquinas para exibir, não faz nada
        if (maquinasExibidas.length === 0) {
            setCards([]);
            return;
        }
        console.log("--- Iniciando fetchExibirMaquinas para:", maquinasExibidas, "---");
        try {
            const cardsDataPromises = maquinasExibidas.map(async (alias) => {
                // `pegarDados(alias)` deve retornar um array de pontos de dados históricos para este alias
                const rawMachineData = await pegarDados(alias);
                if (!rawMachineData || !Array.isArray(rawMachineData) || rawMachineData.length === 0) {
                    console.warn(`Nenhum dado histórico encontrado para a máquina: ${alias}`);
                    return null; // Retorna null para filtrar depois
                }
                // Ordena os pontos de dados históricos desta máquina pelo timestamp (mais recente primeiro)
                const sortedData = rawMachineData.sort((a, b) =>
                    new Date(b.timestamp_coleta).getTime() - new Date(a.timestamp_coleta).getTime()
                );
                // Pega os 30 pontos mais recentes para os dados dos gráficos e o ponto principal
                const latest30Points = sortedData.slice(0, 30);
                const latestPoint = latest30Points[0]; // O ponto de dado mais recente

                if (!latestPoint) {
                    console.warn(`Nenhum ponto de dado recente válido para a máquina: ${alias}`);
                    return null;
                }

                // Mapeia os dados para o formato esperado pelo CardMonitoramento
                return {
                    name: latestPoint?.machine_alias || alias, // Usa machine_alias do dado ou o alias passado
                    hostname: latestPoint?.hostname || "N/A",
                    cpuName: latestPoint?.monitoramento?.cpu?.nome || "N/A",
                    cpuTemp: latestPoint?.monitoramento?.cpu?.temperatura_package_celsius || 0,
                    cpuUso: latestPoint?.monitoramento?.cpu?.percentual_uso || 0,
                    gpuName: latestPoint?.monitoramento?.gpu?.nome || "N/A",
                    gpuTemp: latestPoint?.monitoramento?.gpu?.temperatura_core_celsius || 0,
                    gpuUso: latestPoint?.monitoramento?.gpu?.uso_percentual || 0,
                    ramUso: latestPoint?.monitoramento?.memoria_ram?.percentual_uso || 0,
                    ramTotal: latestPoint?.monitoramento?.memoria_ram?.total_gb || 0,
                    ramEmUso: latestPoint?.monitoramento?.memoria_ram?.usado_gb || 0,
                    armazenamentoUso: latestPoint?.monitoramento?.disco_principal?.percentual_uso || 0,
                    armazenamentoTotal: latestPoint?.monitoramento?.disco_principal?.total_gb,
                    armazenamentoEmUso: latestPoint?.monitoramento?.disco_principal?.usado_gb,
                    // Arrays de dados para gráficos (usando os 30 pontos mais recentes)
                    ramData: latest30Points.map(m => m?.monitoramento?.memoria_ram?.percentual_uso || 0),
                    cpuData: latest30Points.map(m => m?.monitoramento?.cpu?.percentual_uso || 0),
                    gpuData: latest30Points.map(m => m?.monitoramento?.gpu?.uso_percentual || 0),
                    data: latestPoint?.timestamp_coleta || "N/A", // Timestamp do ponto mais recente
                    dataLigada: latestPoint?.monitoramento?.uptime_horas || "N/A"
                };
            });

            // Espera todas as promessas resolverem e filtra quaisquer resultados nulos
            const newCards = (await Promise.all(cardsDataPromises)).filter(card => card !== null);
            setCards(newCards);
            console.log("Cards atualizados:", newCards.length, "cards.");
        } catch (error) {
            console.error("Erro ao buscar dados das máquinas para exibição:", error);
            setErrorMessage("Erro ao buscar dados detalhados das máquinas.");
        } finally {
            console.log("--- fetchExibirMaquinas Concluído ---");
        }
    };

    /**
     * @description Adiciona uma máquina selecionada ao `maquinasExibidas` e remove de `maquinasDisponiveis`.
     * @param {object} maquinaSelecionada - O objeto da máquina a ser selecionada ({ name: string, lastModified: string }).
     */
    const selecionarMaquina = (maquinaSelecionada) => {
        // Verifica se a máquina já não está na lista de exibidas
        if (!maquinasExibidas.includes(maquinaSelecionada.name)) {
            setMaquinasExibidas(prevExibidas => [...prevExibidas, maquinaSelecionada.name]);
            // `maquinasDisponiveis` será atualizado automaticamente pelo useEffect que observa `maquinasExibidas`
            // e também o filtro de busca
        }
        setModalVisible(false); // Fecha o modal após a seleção
        setSearchText(''); // Limpa o texto da busca ao fechar o modal
    };

    /**
     * @description Remove um card da exibição e adiciona a máquina de volta à lista de disponíveis.
     * @param {string} machine_alias - O nome (alias) da máquina a ser removida.
     */
    const removerCard = (machine_alias) => {
        // Remove o card da lista de cards exibidos
        setCards(prevCards => prevCards.filter(card => card.name !== machine_alias));
        // Remove o alias da lista de máquinas exibidas
        setMaquinasExibidas(prevExibidas => prevExibidas.filter(alias => alias !== machine_alias));
        // A lista de `maquinasDisponiveis` será atualizada automaticamente pelo useEffect
        // que observa `maquinasExibidas` e o filtro de busca.
    };

     // Efeito para filtrar as máquinas disponíveis com base no texto de busca
    useEffect(() => {
        const lowerCaseSearchText = searchText.toLowerCase();
        const filtered = maquinasDisponiveis.filter(maquina =>
            maquina.name.toLowerCase().includes(lowerCaseSearchText)
        );
        setFilteredMaquinas(filtered);
    }, [searchText, maquinasDisponiveis]); // Depende do texto de busca e da lista de disponíveis

    // Efeito para buscar a lista de máquinas disponíveis na montagem do componente
    // e sempre que `maquinasExibidas` mudar (para atualizar a lista do modal)
    useEffect(() => {
        fetchMaquinasDisponiveis();
    }, [maquinasExibidas]); // Dependência adicionada para re-executar quando maquinasExibidas muda

    // Efeito para buscar e atualizar os dados das máquinas exibidas em intervalos
    useEffect(() => {
        // Só busca dados se houver máquinas para exibir
        if (maquinasExibidas.length > 0) {
            fetchExibirMaquinas(); // Busca inicial dos dados ao adicionar um novo card
            // Define um intervalo para buscar e atualizar os dados a cada 5 segundos
            const interval = setInterval(() => {
                fetchExibirMaquinas();
                // Opcional: Se quiser que a lista de "disponíveis" no modal também seja atualizada em intervalo
                // fetchMaquinasDisponiveis(); // Se descomentar, descomente no cleanup também
            }, 5000);
            // Limpa o intervalo quando o componente é desmontado ou quando maquinasExibidas muda
            return () => {
                 clearInterval(interval);
                 // if (interval) clearInterval(interval); // Limpa o intervalo opcional também
            }
        } else {
            // Se não há máquinas exibidas, limpa os cards
            setCards([]);
        }
    }, [maquinasExibidas]); // Re-executa quando a lista de máquinas exibidas muda


    // Exibe um indicador de carregamento enquanto os dados iniciais estão sendo buscados
    if (loadingInitialData) {
        return (
            <NativeBaseProvider>
                <VStack bg="#1B1E32" flex={1} justifyContent="center" alignItems="center">
                    <ActivityIndicator size="large" color="#EF233C" />
                    <Text style={styles.loadingText}>Carregando máquinas...</Text>
                </VStack>
            </NativeBaseProvider>
        );
    }

    return (
        <NativeBaseProvider>
            <VStack bg="#1B1E32" flex={1} p={5} alignItems="center" w='100%'>
                {errorMessage && (
                    <View style={styles.errorContainer}>
                        <Text style={styles.errorText}>{errorMessage}</Text>
                        <TouchableOpacity onPress={() => setErrorMessage(null)} style={styles.errorCloseButton}>
                            <Text style={styles.errorCloseButtonText}>X</Text>
                        </TouchableOpacity>
                    </View>
                )}
                {/* Removidas as barras de rolagem do ScrollView principal */}
                <ScrollView contentContainerStyle={styles.grid} showsVerticalScrollIndicator={false} showsHorizontalScrollIndicator={false}>
                    {/* Renderiza os cards de monitoramento das máquinas exibidas */}
                    {cards.map((item, index) => (
                        // Usar item.name como key é mais estável que o index se o nome for único
                        <VStack key={item.name || index} position="relative">
                            <CardMonitoramento {...item} onRemove={() => removerCard(item.name)} />
                        </VStack>
                    ))}
                    {/* Botão para abrir o modal de seleção de máquinas */}
                    <VStack style={styles.cardPlaceholder}>
                        <TouchableOpacity style={styles.botao} onPress={() => setModalVisible(true)}>
                            <Text style={styles.botaoTexto}>+</Text>
                        </TouchableOpacity>
                    </VStack>
                </ScrollView>

                {/* Modal para selecionar máquinas disponíveis */}
                <Modal visible={modalVisible} transparent animationType="slide">
                    <VStack style={styles.modalContainer}>
                        <Text style={styles.modalTitle}>Selecione uma máquina:</Text>

                        {/* Barra de Pesquisa */}
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Buscar máquina..."
                            placeholderTextColor="#AAA"
                            value={searchText}
                            onChangeText={setSearchText}
                        />

                        <FlatList
                            data={filteredMaquinas} // Usa a lista filtrada
                            keyExtractor={item => item.name}
                            renderItem={({ item }) => {
                                // Lógica do indicador de última modificação movida para cá, sem usar moment
                                const timeDifferenceSeconds = (new Date().getTime() - new Date(item.lastModified).getTime()) / 1000;
                                let indicatorComponent;

                                if (timeDifferenceSeconds < 20) {
                                    indicatorComponent = <Text style={{ color: 'green', fontWeight: 'bold',
                                                            textShadowColor: 'black',
                                                            textShadowOffset: { width: -1, height: 1 },
                                                            textShadowRadius: 1,
                                                            borderRadius: 5, padding: 10 }}>III
                                                            </Text>;
                                } else if (timeDifferenceSeconds >= 20 && timeDifferenceSeconds < 60) {
                                    indicatorComponent = (
                                        <Text style={{ borderRadius: 5, padding: 10}}>
                                            <Text style={{
                                                            color: 'yellow',
                                                            fontWeight: 'bold',
                                                            textShadowColor: 'black',
                                                            textShadowOffset: { width: -1, height: 1 },
                                                            textShadowRadius: 1,
                                                        }}>
                                                            I
                                                        </Text>
                                                        <Text style={{
                                                            color: 'yellow',
                                                            fontWeight: 'bold',
                                                            textShadowColor: 'black',
                                                            textShadowOffset: { width: -1, height: 1 },
                                                            textShadowRadius: 1,
                                                        }}>
                                                            I
                                                        </Text>
                                                        <Text style={{
                                                            color: '#DDD',
                                                            fontWeight: 'bold',
                                                            textShadowColor: 'black',
                                                            textShadowOffset: { width: -1, height: 1 },
                                                            textShadowRadius: 1,
                                                        }}>
                                                            I
                                                        </Text>
                                        </Text>
                                    );
                                } else if (timeDifferenceSeconds >= 60 && timeDifferenceSeconds < 120) {
                                    indicatorComponent = (
                                        <Text>
                                            <Text style={{ color: 'red', fontWeight: 'bold',
                                                            textShadowColor: 'black',
                                                            textShadowOffset: { width: -1, height: 1 },
                                                            textShadowRadius: 1, }}>I</Text>
                                            <Text style={{ color: '#DDD', fontWeight: 'bold',
                                                            textShadowColor: 'black',
                                                            textShadowOffset: { width: -1, height: 1 },
                                                            textShadowRadius: 1, }}>I</Text>
                                            <Text style={{ color: '#DDD', fontWeight: 'bold',
                                                            textShadowColor: 'black',
                                                            textShadowOffset: { width: -1, height: 1 },
                                                            textShadowRadius: 1, }}>I</Text>
                                        </Text>
                                    );
                                } else {
                                    indicatorComponent = <Text style={{ color: 'red', fontWeight: 'bold',
                                                            textShadowColor: 'black',
                                                            textShadowOffset: { width: -1, height: 1 },
                                                            textShadowRadius: 1, borderRadius: 5, padding: 10
                                                         }}>X</Text>;
                                }

                                return (
                                    <TouchableOpacity style={styles.machineItem} onPress={() => selecionarMaquina(item)}>
                                        {/* HStack para alinhar nome e indicador */}
                                        <HStack justifyContent="space-between" alignItems="center" w="100%">
                                            <Text style={styles.machineText}>{item.name}</Text>
                                            {indicatorComponent}
                                        </HStack>
                                    </TouchableOpacity>
                                );
                            }}
                            ListEmptyComponent={ // Componente exibido se a lista filtrada estiver vazia
                                <Text style={styles.emptyListText}>Nenhuma máquina disponível.</Text>
                            }
                            showsVerticalScrollIndicator={true} // Adiciona barra de rolagem vertical ao FlatList
                            style={styles.flatListStyle} // Estilo para o FlatList
                        />

                        <TouchableOpacity style={styles.modalClose} onPress={() => setModalVisible(false)}>
                            <Text style={styles.modalCloseText}>Fechar</Text>
                        </TouchableOpacity>
                    </VStack>
                </Modal>
            </VStack>
        </NativeBaseProvider>
    );
};

const styles = StyleSheet.create({
    botao: {
        backgroundColor: '#EF233C',
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
    },
    botaoTexto: {
        fontSize: 30,
        color: '#FFF',
        fontWeight: 'bold',
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        alignItems: 'center',
    },
    cardPlaceholder: {
        width: cardWidth,
        height: 200,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        position: 'absolute',
        top: "20%",
        left: "25%",
        width: "50%",
        maxHeight: "60%", // Limita a altura do modal para não sair da tela em muitos itens
        backgroundColor: "#2B2D42",
        padding: 20,
        borderRadius: 10,
        alignItems: "center",
        alignSelf: "center",
        elevation: 10, // Sombra para Android
        shadowColor: '#000', // Sombra para iOS
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    modalTitle: {
        fontSize: 18,
        color: "#FFF",
        fontWeight: "bold",
        marginBottom: 10
    },
    searchInput: {
        width: '80%',
        height: 60,
        backgroundColor: '#FFF',
        borderRadius: 5,
        paddingHorizontal: 10,
        marginBottom: 10,
        color: '#000', // Cor do texto digitado
    },
    machineItem: {
        backgroundColor: "#EF233C",
        padding: 10,
        borderRadius: 5,
        marginVertical: 5,
        width: '100%', // Para ocupar toda a largura do modal
        alignItems: 'center',
    },
    machineText: {
        color: "#FFF",
        fontSize: 16,
        fontWeight: 'bold',
        // Remover textAlign: 'center' para alinhar à esquerda dentro do HStack
    },
    machineLastModifiedText: {
        color: "#DDD",
        fontSize: 12,
        marginTop: 4,
        // Remover textAlign: 'center' se você estiver usando HStack para alinhar
    },
    modalClose: {
        marginTop: 15,
        backgroundColor: "#D32F2F",
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 5,
    },
    modalCloseText: {
        color: "#FFF",
        fontWeight: "bold"
    },
    emptyListText: {
        color: "#FFF",
        fontSize: 16,
        textAlign: 'center',
        marginTop: 20,
    },
    loadingText: {
        color: "#FFF",
        fontSize: 18,
        marginTop: 10,
    },
    errorContainer: {
        backgroundColor: '#FFEBEE', // Cor de fundo suave para erro
        borderColor: '#EF5350', // Borda vermelha
        borderWidth: 1,
        borderRadius: 8,
        padding: 12,
        marginHorizontal: 10,
        marginBottom: 10,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '95%',
    },
    errorText: {
        color: '#D32F2F', // Texto vermelho escuro
        fontSize: 14,
        flexShrink: 1, // Permite que o texto quebre linha
    },
    errorCloseButton: {
        padding: 5,
        marginLeft: 10,
    },
    errorCloseButtonText: {
        color: '#D32F2F',
        fontWeight: 'bold',
        fontSize: 16,
    },
    flatListStyle: {
        width: '100%', // Garante que o FlatList ocupe a largura total do modal
    }
});

export default App;