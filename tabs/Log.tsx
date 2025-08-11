import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TextInput, Platform, ScrollView } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { pegarLogDasMaquinas, pegarNomeDasMaquinas, relatorioMes } from '../servicos/dadosServicos';
import Botao from '../components/Botao';
import Clipboard from '@react-native-clipboard/clipboard';
import DashboardMonitoramento from '../components/CardLog';
import Tarefas from '../components/Tarefas';

const LogOcorrencia = () => {
  const [maquinas, setMaquinas] = useState([]);
  const [maquinaSelecionada, setMaquinaSelecionada] = useState('');
  const [dataSelecionada, setDataSelecionada] = useState('');
  const [ocorrenciaSelecionada, setOcorrenciaSelecionada] = useState('');
  const [ocorrenciaTexto, setOcorrenciaTexto] = useState('');
  const [dadoRelatorioMes, setDadoRelatorioMes] = useState([]);

  const [dadosMaquina, setDadosMaquina] = useState('');
  const [visivel, setVisivel] = useState(false);
  const [indiceOcorrenciaSelecionada, setIndiceOcorrenciaSelecionada] = useState('');

  const opcoesOcorrencia = [
    { label: 'CPU temp', value: 'temperatura_package_celsius' },
    { label: 'CPU Uso', value: 'uso_total_percent' },
    { label: 'RAM Uso', value: 'percentual_uso' },
    { label: 'Disco Principal Uso', value: 'percentual_uso' },
    { label: 'GPU Uso', value: 'uso_percentual' },
    { label: 'GPU Temp', value: 'temperatura_core_celsius' },
    { label: 'Offline', value: 'timestamp_coleta' },
  ];

  const copiarJson = () => {
  const texto = JSON.stringify(dadosMaquina, null, 2);
  Clipboard.setString(texto);
};

  useEffect(() => {
    const carregarMaquinas = async () => {
      try {
        const resposta = await pegarNomeDasMaquinas();
        if (resposta?.machineAliases) {
          setMaquinas(resposta.machineAliases);
        }
      } catch (e) {
        console.error('Erro ao buscar máquinas:', e);
      }
    };

    const carregarRelatorio = async () => {
      const hoje = new Date();
      const formatado = formatarParaDiaMesAno(hoje);
      try {
        const resposta = await relatorioMes(formatado);
        if (Array.isArray(resposta)) {
          setDadoRelatorioMes(resposta);
        }
      } catch (error) {
        console.error('Erro ao carregar relatório:', error);
      }
    };

    carregarMaquinas();
    carregarRelatorio();
  }, []);

  const formatarParaDiaMesAno = (data) => {
    const dia = String(data.getDate()).padStart(2, '0');
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const ano = data.getFullYear();
    return `${dia}-${mes}-${ano}`;
  };

  const formatarData = (isoDate) => {
    if (!isoDate) return '';
    const [ano, mes, dia] = isoDate.split('-');
    return `${dia}/${mes}/${ano}`;
  };

  useEffect(() => {
  const atualizarRelatorioPorData = async () => {
    if (dataSelecionada.trim() === '') return;

    // Formato esperado: DD-MM-YYYY
    const [dia, mes, ano] = dataSelecionada.split('/');
    const dataFormatada = `${dia}-${mes}-${ano}`;

    try {
      const resposta = await relatorioMes(dataFormatada);
      if (Array.isArray(resposta)) {
        setDadoRelatorioMes(resposta);
      }
    } catch (error) {
      console.error('Erro ao buscar relatório por dia:', error);
    }
  };

  atualizarRelatorioPorData();
}, [dataSelecionada]);

  const checarLog = async () => {
    try {
      const resposta = await pegarLogDasMaquinas(
        maquinaSelecionada,
        dataSelecionada,
        ocorrenciaSelecionada,
        ocorrenciaTexto
      );
      if (resposta) {
        setDadosMaquina(resposta);
        setVisivel(true);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const renderInputData = () => {
    if (Platform.OS === 'web') {
      return (
        <input
          type="date"
          style={styles.dateInputWeb}
          onChange={(e) => setDataSelecionada(formatarData(e.target.value))}
        />
      );
    }

    return (
      <TextInput
        style={styles.input}
        placeholder="dd/mm/aaaa"
        value={dataSelecionada}
        onChangeText={(texto) => setDataSelecionada(texto)}
      />
    );
  };

  const gerarOpcoesRelatorio = () => {
    if (!Array.isArray(dadoRelatorioMes)) return [];
    return dadoRelatorioMes.map((item, index) => {
      const [labelOcorrencia] = Object.keys(item.ocorrencia);
      const valorOcorrencia = item.ocorrencia[labelOcorrencia];
      const label = `${item.maquina} - ${labelOcorrencia}: ${valorOcorrencia}`;
      return {
        key: index,
        label,
        maquina: item.maquina,
        horario: item.horario,
        tipo: labelOcorrencia,
        valor: valorOcorrencia
      };
    });
  };

  const selecionarOcorrenciaRelatorio = (index) => {
    setIndiceOcorrenciaSelecionada(index);
    const escolhido = gerarOpcoesRelatorio()[index];
    if (!escolhido) return;

    setMaquinaSelecionada(escolhido.maquina);

    const dataObj = new Date(escolhido.horario);
    const dia = String(dataObj.getDate()).padStart(2, '0');
    const mes = String(dataObj.getMonth() + 1).padStart(2, '0');
    const ano = dataObj.getFullYear();
    setDataSelecionada(`${dia}/${mes}/${ano}`);

    const itemOpcao = opcoesOcorrencia.find(o => o.label === escolhido.tipo);
    if (itemOpcao) {
      setOcorrenciaSelecionada(itemOpcao.value);
      setOcorrenciaTexto(escolhido.valor);
    } else {
      setOcorrenciaSelecionada('timestamp_coleta');
      setOcorrenciaTexto('');
    }
  };

  const jsonMontado = {
    machine_alias: maquinaSelecionada,
    dataOcorencia: dataSelecionada,
    tipoDeOcorrencia: `${ocorrenciaSelecionada}: ${ocorrenciaTexto}`
  };

  return (
    <ScrollView style={{ backgroundColor: '#0F1121' }}>
      <View style={styles.container}>
        <Text style={styles.titulo}>Log de Ocorrência</Text>

        <View style={styles.item}>
          <Text style={styles.label}>Data</Text>
          {renderInputData()}
        </View>

        <View style={styles.item}>
          <Text style={styles.label}>Últimas ocorrências</Text>
          <Picker
            selectedValue={indiceOcorrenciaSelecionada}
            onValueChange={(valor) => selecionarOcorrenciaRelatorio(valor)}
            style={styles.picker}
          >
            <Picker.Item label="--" value="" />
            {gerarOpcoesRelatorio().map(item => (
              <Picker.Item key={item.key} label={item.label} value={item.key} />
            ))}
          </Picker>
        </View>

        <View style={styles.row}>
          <View style={styles.item}>
            <Text style={styles.label}>Máquina</Text>
            <Picker
              selectedValue={maquinaSelecionada}
              onValueChange={(valor) => setMaquinaSelecionada(valor)}
              style={styles.picker}
            >
              <Picker.Item label="--" value="" />
              {maquinas.map((item) => (
                <Picker.Item key={item.name} label={item.name} value={item.name} />
              ))}
            </Picker>
          </View>

          <View style={styles.item}>
            <Text style={styles.label}>Ocorrência</Text>
            <Picker
              selectedValue={ocorrenciaSelecionada}
              onValueChange={(valor) => setOcorrenciaSelecionada(valor)}
              style={styles.picker}
            >
              <Picker.Item label="--" value="" />
              {opcoesOcorrencia.map((item) => (
                <Picker.Item key={item.value} label={item.label} value={item.value} />
              ))}
            </Picker>
          </View>

          <View style={styles.item}>
            <Text style={styles.label}>Valor</Text>
            <TextInput
                style={styles.input}
                placeholder="valor"
                keyboardType="numeric"
                value={ocorrenciaTexto}
                onChangeText={(texto) => {
                const valorLimpo = texto
                    .replace(/[^0-9.]/g, '')    
                    .replace(/(\..*)\./g, '$1') 
                    .slice(0, 4);              
                setOcorrenciaTexto(valorLimpo);
                }}
            />
            </View>

          <View style={styles.item}>
            <Text style={styles.label}>{' '}</Text>
            <Botao titulo="Buscar" aoPressionar={checarLog} />
          </View>
        </View>



        {visivel && (
        <>
        <DashboardMonitoramento dados={dadosMaquina}/>

       
        <Text style={{fontSize: 18, fontWeight: 'bold', color: '#fff', marginBottom: 12, marginLeft: 16,}}>Processos em andamento</Text>
        <View style={{flexDirection: 'row', marginBottom: '10%'}}>
                  <Tarefas
                    titulo="Uso de CPU"
                    processos={
                      dadosMaquina?.monitoramento?.top_processos?.top_cpu_processes?.length >= 3 &&
                      typeof dadosMaquina.monitoramento.cpu?.percentual_uso === 'number'
                        ? [
                            {
                              nome: dadosMaquina.monitoramento.top_processos.top_cpu_processes[0]?.name || 'N/A',
                              uso: `${(
                                (dadosMaquina.monitoramento.top_processos.top_cpu_processes[0]?.cpu_percent /
                                  (
                                    dadosMaquina.monitoramento.top_processos.top_cpu_processes[0]?.cpu_percent +
                                    dadosMaquina.monitoramento.top_processos.top_cpu_processes[1]?.cpu_percent +
                                    dadosMaquina.monitoramento.top_processos.top_cpu_processes[2]?.cpu_percent
                                  )) *
                                dadosMaquina.monitoramento.cpu.percentual_uso
                              ).toFixed(2)}%`
                            },
                            {
                              nome: dadosMaquina.monitoramento.top_processos.top_cpu_processes[1]?.name || 'N/A',
                              uso: `${(
                                (dadosMaquina.monitoramento.top_processos.top_cpu_processes[1]?.cpu_percent /
                                  (
                                    dadosMaquina.monitoramento.top_processos.top_cpu_processes[0]?.cpu_percent +
                                    dadosMaquina.monitoramento.top_processos.top_cpu_processes[1]?.cpu_percent +
                                    dadosMaquina.monitoramento.top_processos.top_cpu_processes[2]?.cpu_percent
                                  )) *
                                dadosMaquina.monitoramento.cpu.percentual_uso
                              ).toFixed(2)}%`
                            },
                            {
                              nome: dadosMaquina.monitoramento.top_processos.top_cpu_processes[2]?.name || 'N/A',
                              uso: `${(
                                (dadosMaquina.monitoramento.top_processos.top_cpu_processes[2]?.cpu_percent /
                                  (
                                    dadosMaquina.monitoramento.top_processos.top_cpu_processes[0]?.cpu_percent +
                                    dadosMaquina.monitoramento.top_processos.top_cpu_processes[1]?.cpu_percent +
                                    dadosMaquina.monitoramento.top_processos.top_cpu_processes[2]?.cpu_percent
                                  )) *
                                dadosMaquina.monitoramento.cpu.percentual_uso
                              ).toFixed(2)}%`
                            }
                          ]
                        : [
                            { nome: 'N/A', uso: 'N/A' },
                            { nome: 'N/A', uso: 'N/A' },
                            { nome: 'N/A', uso: 'N/A' }
                          ]
                    }
                  />

                  <Tarefas
                    titulo="Uso de RAM"
                    processos={
                      dadosMaquina?.monitoramento?.top_processos?.top_ram_processes?.length >= 3 &&
                      typeof dadosMaquina.monitoramento.memoria_ram?.percentual_uso === 'number'
                        ? [
                            {
                              nome: dadosMaquina.monitoramento.top_processos.top_ram_processes[0]?.name || 'N/A',
                              uso: `${(
                                ((dadosMaquina.monitoramento.top_processos.top_ram_processes[0]?.memory_percent * 100) /
                                  (
                                    (dadosMaquina.monitoramento.top_processos.top_ram_processes[0]?.memory_percent +
                                      dadosMaquina.monitoramento.top_processos.top_ram_processes[1]?.memory_percent +
                                      dadosMaquina.monitoramento.top_processos.top_ram_processes[2]?.memory_percent) * 100
                                  )) *
                                dadosMaquina.monitoramento.memoria_ram.percentual_uso
                              ).toFixed(2)}%`
                            },
                            {
                              nome: dadosMaquina.monitoramento.top_processos.top_ram_processes[1]?.name || 'N/A',
                              uso: `${(
                                ((dadosMaquina.monitoramento.top_processos.top_ram_processes[1]?.memory_percent * 100) /
                                  (
                                    (dadosMaquina.monitoramento.top_processos.top_ram_processes[0]?.memory_percent +
                                      dadosMaquina.monitoramento.top_processos.top_ram_processes[1]?.memory_percent +
                                      dadosMaquina.monitoramento.top_processos.top_ram_processes[2]?.memory_percent) * 100
                                  )) *
                                dadosMaquina.monitoramento.memoria_ram.percentual_uso
                              ).toFixed(2)}%`
                            },
                            {
                              nome: dadosMaquina.monitoramento.top_processos.top_ram_processes[2]?.name || 'N/A',
                              uso: `${(
                                ((dadosMaquina.monitoramento.top_processos.top_ram_processes[2]?.memory_percent * 100) /
                                  (
                                    (dadosMaquina.monitoramento.top_processos.top_ram_processes[0]?.memory_percent +
                                      dadosMaquina.monitoramento.top_processos.top_ram_processes[1]?.memory_percent +
                                      dadosMaquina.monitoramento.top_processos.top_ram_processes[2]?.memory_percent) * 100
                                  )) *
                                dadosMaquina.monitoramento.memoria_ram.percentual_uso
                              ).toFixed(2)}%`
                            }
                          ]
                        : [
                            { nome: 'Null', uso: 'N/A' },
                            { nome: 'Null', uso: 'N/A' },
                            { nome: 'Null', uso: 'N/A' }
                          ]
                    }
                  />
                  
        </View>
          
                  

        <Botao titulo="Copiar JSON" aoPressionar={copiarJson} />
            <Text style={styles.resultado}>
            <Text style={styles.bold}>
                {JSON.stringify(dadosMaquina, null, 2)}
            </Text>
            </Text>

            
        </>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    maxWidth: 1200,
    alignSelf: 'center',
  },
  titulo: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
    color: '#fff'
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'center',
    alignItems: 'flex-end',
    flexWrap: 'wrap',
  },
  item: {
    flex: 1,
    minWidth: 150,
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    marginBottom: 4,
    color: '#fff',
    fontWeight: 'bold'
  },
  picker: {
    height: 50,
    width: '100%',
    backgroundColor: '#2A2F4A',
    borderRadius: 6,
    paddingHorizontal: 6,
    color: '#fff'
  },
  input: {
    height: 50,
    width: '100%',
    backgroundColor: '#2A2F4A',
    paddingHorizontal: 10,
    borderColor: '#ccc',
    borderWidth: 0,
    borderRadius: 6,
    color: '#fff'
  },
  dateInputWeb: {
    height: 50,
    width: '100%',
    padding: '10px',
    fontSize: 16,
    borderColor: '#ccc',
    borderWidth: 0,
    borderRadius: 6,
    backgroundColor: '#2A2F4A',
    color: '#fff'
  },
  resultado: {
    marginTop: 30,
    fontSize: 16,
    lineHeight: 22,
    backgroundColor: '#1C1E35',
    padding: 10,
    borderRadius: 6,
  },
  bold: {
    fontWeight: 'bold',
    color: '#fff'
  }
});

export default LogOcorrencia;