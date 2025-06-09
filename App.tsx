import React, { useEffect, useState } from 'react';
import { ScrollView, TouchableOpacity, Text, StyleSheet, Dimensions, Modal, FlatList } from 'react-native';
import { VStack, NativeBaseProvider } from 'native-base';
import { pegarDados, pegarNomeDasMaquinas } from './servicos/dadosServicos';
import CardMonitoramento from './components/CardMonitoramento';
//import CardMonitoramento from './components/CardMonitoramentoOld';


const screenWidth = Dimensions.get('window').width;
const cardWidth = screenWidth * 0.42;

const App = () => {
    const [cards, setCards] = useState<any[]>([]);
    const [maquinasExibidas, setMaquinasExibidas] = useState<any[]>([]);
    const [maquinasDisponiveis, setMaquinasDisponiveis] = useState<any[]>([]);
    const [modalVisible, setModalVisible] = useState(false);

    // Buscar máquinas disponíveis e armazenar no estado
    const fetchMaquinasDisponiveis = async () => {
        try {
            const resultado = await pegarNomeDasMaquinas();
            if (resultado && resultado.machineAliases) {
                const maquinasFiltradas = resultado.machineAliases.filter((alias: any) => !maquinasExibidas.includes(alias));
                setMaquinasDisponiveis(maquinasFiltradas);
            }
        } catch (error) {
            console.error("Erro ao buscar máquinas disponíveis:", error);
        }
    };

    // Buscar dados das máquinas exibidas e atualizar os cards
const fetchExibirMaquinas = async () => {
    try {
        const todasMaquinas = await Promise.all(
            maquinasExibidas.map(async (alias) => {
                const resultado = await pegarDados(alias);
                return resultado ? resultado : null;
            })
        );

        const ultimos30 = todasMaquinas
            .filter(machine => machine !== null)
            .sort((a, b) => new Date(b.timestamp_coleta).getTime() - new Date(a.timestamp_coleta).getTime())
            .slice(0, 30);

        if (ultimos30.length === 0) {
            console.warn("Nenhum dado recebido, mantendo os cards anteriores.");
            return; // Não atualiza `setCards`, mantendo os valores existentes
        }
        const ultimo = ultimos30.length - 1

        setCards(ultimos30.map(machine => ({
            name: machine[ultimo]?.machine_alias || "Sem nome",
            hostname: machine[ultimo]?.hostname || "Sem nome",
            cpuName: machine[ultimo]?.monitoramento?.cpu?.nome || "N/A",
            cpuTemp: machine[ultimo]?.monitoramento?.cpu?.temperatura_package_celsius || 0,
            cpuUso: machine[ultimo]?.monitoramento?.cpu?.percentual_uso || 0,
            gpuName: machine[ultimo]?.monitoramento?.gpu?.nome || "N/A",
            gpuTemp: machine[ultimo]?.monitoramento?.gpu?.temperatura_core_celsius || 0,
            gpuUso: machine[ultimo]?.monitoramento?.gpu?.uso_percentual || 0,
            ramUso: machine[ultimo]?.monitoramento?.memoria_ram?.percentual_uso || 0,
            ramTotal: machine[ultimo]?.monitoramento?.memoria_ram?.total_gb || 0,
            ramEmUso: machine[ultimo]?.monitoramento?.memoria_ram?.usado_gb || 0,
            armazenamentoUso: machine[ultimo]?.monitoramento?.disco_principal?.percentual_uso || 0,
            armazenamentoTotal: machine[ultimo]?.monitoramento?.disco_principal?.total_gb,
            armazenamentoEmUso: machine[ultimo]?.monitoramento?.disco_principal?.usado_gb,
            ramData: machine.slice(0, 30).map((m: { monitoramento: { memoria_ram: { percentual_uso: any; }; }; }) => m?.monitoramento?.memoria_ram?.percentual_uso || 0),
            cpuData: machine.slice(0, 30).map((m: { monitoramento: { cpu: { percentual_uso: any; }; }; }) => m?.monitoramento?.cpu?.percentual_uso || 0),
            gpuData: machine.slice(0, 30).map((m: { monitoramento: { gpu: { uso_percentual: any; }; }; }) => m?.monitoramento?.gpu?.uso_percentual || 0),
            data: machine[ultimo]?.timestamp_coleta || "N/A",
            dataLigada: machine[ultimo]?.monitoramento?.uptime_horas || "N/A"
        })));
    } catch (error) {
        console.error("Erro ao buscar dados das máquinas:", error);
        // Apenas ignora a atualização e mantém os cards existentes
    }
};

    // Adicionar máquina ao estado e remover do modal
    const selecionarMaquina = (machine_alias: any) => {
        if (!maquinasExibidas.includes(machine_alias)) {
            setMaquinasExibidas(prevExibidas => [...prevExibidas, machine_alias]);
            setMaquinasDisponiveis(prevDisponiveis => prevDisponiveis.filter(alias => alias !== machine_alias));
        }
        setModalVisible(false);
    };

    // Remover máquina da tela e adicionar de volta ao modal
const removerCard = (machine_alias: any) => {
    setCards(prevCards => {
        const atualizadas = prevCards.filter(card => card.name !== machine_alias);
        return [...atualizadas]; // Retorna a nova lista de cards
    });

    setMaquinasExibidas(prevExibidas => {
        const atualizadas = prevExibidas.filter(alias => alias !== machine_alias);
        return [...atualizadas]; // Retorna a nova lista de exibidas
    });

    setMaquinasDisponiveis(prevDisponiveis => {
        return prevDisponiveis.includes(machine_alias) ? prevDisponiveis : [...prevDisponiveis, machine_alias]; 
    });
};

useEffect(() => {
    fetchMaquinasDisponiveis();
}, []);

// Atualização automática dos dados a cada 1 segundo
useEffect(() => {
    if (maquinasExibidas.length > 0) {
        fetchExibirMaquinas();

        const interval = setInterval(() => {
            fetchExibirMaquinas();
            fetchMaquinasDisponiveis();
        }, 1000);

        return () => clearInterval(interval); // Limpa o intervalo ao desmontar
    }
}, [maquinasExibidas]);

    return (
        <NativeBaseProvider>
            <VStack bg="#1B1E32" flex={1} p={5} alignItems="center" w='100%'>
                <ScrollView contentContainerStyle={styles.grid}>
                    {cards.map((item, index) => (
                        <VStack key={index} position="relative">
                            <CardMonitoramento {...item} onRemove={() => removerCard(item.name)} />
                        </VStack>
                    ))}

                    {/* Botão para abrir o modal */}
                    <VStack style={styles.cardPlaceholder}>
                        <TouchableOpacity style={styles.botao} onPress={() => setModalVisible(true)}>
                            <Text style={styles.botaoTexto}>+</Text>
                        </TouchableOpacity>
                    </VStack>
                </ScrollView>

                {/* Modal para selecionar máquinas */}
                <Modal visible={modalVisible} transparent animationType="slide">
                    <VStack style={styles.modalContainer}>
                        <Text style={styles.modalTitle}>Selecione uma máquina:</Text>
                        <FlatList
                            data={maquinasDisponiveis}
                            keyExtractor={item => item}
                            renderItem={({ item }) => (
                                <TouchableOpacity style={styles.machineItem} onPress={() => selecionarMaquina(item)}>
                                    <Text style={styles.machineText}>{item}</Text>
                                </TouchableOpacity>
                            )}
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
        left: "10%",
        width: "80%",
        backgroundColor: "#2B2D42",
        padding: 20,
        borderRadius: 10,
        alignItems: "center"
    },
    modalTitle: {
        fontSize: 18,
        color: "#FFF",
        fontWeight: "bold",
        marginBottom: 10
    },
    machineItem: {
        backgroundColor: "#EF233C",
        padding: 10,
        borderRadius: 5,
        marginVertical: 5
    },
    machineText: {
        color: "#FFF",
        fontSize: 16
    },
    modalClose: {
        marginTop: 10,
        backgroundColor: "#D32F2F",
        padding: 10,
        borderRadius: 5
    },
    modalCloseText: {
        color: "#FFF",
        fontWeight: "bold"
    }
});

export default App;