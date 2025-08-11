// tabs/RelatorioScreen.js

import React, { useEffect, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions
} from 'react-native';
import {
  NativeBaseProvider,
  VStack,
  HStack,
  Text,
  Select,
  Box
} from 'native-base';
import {
  VictoryChart,
  VictoryLine,
  VictoryAxis,
  VictoryTheme,
  VictoryPie,
  VictoryLabel
} from 'victory';
import { useNavigation } from '@react-navigation/native';

export default function RelatorioScreen() {
  const [relatorio, setRelatorio] = useState([]);
  const [mesSelecionado, setMesSelecionado] = useState('');
  const { width } = useWindowDimensions();
  const navigation = useNavigation();

  useEffect(() => {
    fetch('http://10.10.10.61:2500/relatorio')
      .then(res => res.json())
      .then(data => setRelatorio(data))
      .catch(err => console.error(err));
  }, []);

  // Agrupa chamados por mês
  const porMes = relatorio.reduce((acc, item) => {
    const d = new Date(item.horario);
    const key = `${String(d.getMonth()+1).padStart(2,'0')}-${d.getFullYear()}`;
    acc[key] = (acc[key]||0) + 1;
    return acc;
  }, {});
  const linhaData = Object.entries(porMes).map(([x,y]) => ({ x, y }));

  // Agrupa ocorrências por tipo (conta +1 para cada ocorrência)
  const porTipo = {};
  relatorio.forEach(item => {
    Object.keys(item.ocorrencia).forEach(tipo => {
      porTipo[tipo] = (porTipo[tipo] || 0) + 1;
    });
  });
  const tipoData = Object.entries(porTipo).map(([x,y]) => ({ x, y }));

  // Agrupa chamados por máquina
  const porMaquina = {};
  relatorio.forEach(item => {
    const m = item.maquina.toUpperCase();
    porMaquina[m] = (porMaquina[m] || 0) + 1;
  });
  const maquinaData = Object.entries(porMaquina).map(([x,y]) => ({ x, y }));

  const colW = width >= 768 ? width/3 - 20 : width - 40;

  return (
    <NativeBaseProvider>
      <ScrollView style={{ backgroundColor:'#0F1121' }} showsVerticalScrollIndicator={false}>
        <VStack space={6} padding={6}>

          {/* Cabeçalho */}
          <HStack
            justifyContent="space-between"
            flexWrap="wrap"
            bgColor='#0F1128'
            padding='10'
            w='100%'
            borderBottomWidth={4}
            borderBottomColor='#EF233C'
            borderBottomRadius={10}
          >
            <Text style={styles.titulo}>10KK VIEW CHROMATOX</Text>
            <HStack space={3} mt={[4,0]}>
             <TouchableOpacity
                style={styles.botaoSecundario}
                onPress={() => 
                  navigation.navigate('LogOcorrencia')}
              >
                <Text style={styles.textoBotao}>Log de ocorrência</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.botaoSecundario}
                onPress={() => navigation.navigate('View')}
              >
                <Text style={styles.textoBotao}>Visualizar máquinas</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.botaoPrimario}
                onPress={() => navigation.navigate('Chamados')}
              >
                <Text style={styles.textoBotao}>Abrir chamado</Text>
              </TouchableOpacity>
            </HStack>
          </HStack>

          <Text color='#fff'>O sistema fornece uma interface interativa para visualização e análise de dados operacionais coletados automaticamente a partir de agentes de monitoramento instalados nas máquinas da rede.
          Esses agentes capturam em tempo real métricas como uso de CPU, memória RAM, temperatura, uso de disco, entre outros parâmetros críticos, e transmitem essas informações ao servidor central.
          Através desta interface, é possível acompanhar o histórico de anomalias e desempenho das máquinas ao longo do tempo. Para isso, selecione o mês desejado no campo abaixo e visualize um relatório consolidado com gráficos e detalhes sobre os eventos registrados no período selecionado.
          </Text>

          {/* Filtros + Gerar relatório */}
          <HStack mt={4} space={4} flexWrap="wrap" ml='2%' mb='5%'>
            <Select
              selectedValue={mesSelecionado}
              minWidth="170"
              placeholder="Mês/Ano"
              _selectedItem={{ bg: "#3E3E57" }}
              bg="#1C1E36"
              borderColor="#333"
              color="#FFF"
              onValueChange={setMesSelecionado}
            >
              {Object.keys(porMes).map(mes => (
                <Select.Item key={mes} label={mes.replace('-','/')} value={mes} />
              ))}
            </Select>
            <TouchableOpacity
              style={styles.botaoBusca}
              onPress={() => {
                if (mesSelecionado) {
                  navigation.navigate('RelatorioMes', { mesAno: mesSelecionado });
                }
              }}
            >
              <Text style={styles.textoBotaoBusca}>Mostrar relatório</Text>
            </TouchableOpacity>
          </HStack>

          <Text color='#fff' mb='5%'>Os gráficos abaixo representam um panorama completo de todas as anomalias registradas desde a ativação do agente de monitoramento, cobrindo todo o período disponível no histórico coletado.</Text>

          {/* Gráficos lado a lado */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <HStack space={4} paddingBottom={4} flexWrap="nowrap" minWidth={width}>
              
              {/* Linha por mês */}
              <Box width={colW} minWidth={240}>
                <Text style={styles.subtitulo}>Chamados por Mês</Text>
                <VictoryChart height={250} theme={VictoryTheme.material} domainPadding={20}>
                  <VictoryAxis
                    style={{ tickLabels:{ fill:'#FFF', fontSize:9 } }}
                    tickFormat={t => typeof t==='string' ? t.replace('-','/') : String(t)}
                  />
                  <VictoryAxis
                    dependentAxis
                    style={{ axis:{stroke:'none'}, tickLabels:{ fill:'transparent' } }}
                  />
                  <VictoryLine
                    data={linhaData}
                    labels={({datum}) => datum.y}
                    labelComponent={
                      <VictoryLabel
                        dy={-8}
                        style={{ fill:'#FFF', fontSize:10, fontWeight:'bold' }}
                      />
                    }
                    style={{ data:{ stroke:'#00CED1', strokeWidth:2 } }}
                  />
                </VictoryChart>
              </Box>

              {/* Ocorrências */}
              <Box width={colW} minWidth={240}>
                <Text style={styles.subtitulo}>Ocorrências</Text>
                <VictoryPie
                  data={tipoData}
                  colorScale={["#FFD700","#FF6347","#87CEEB","#20B2AA","#DD66CC"]}
                  labels={({datum}) => `${datum.x}\n${datum.y}`}
                  innerRadius={20}
                  labelRadius={70}
                  height={280}
                  width={250}
                  padAngle={2}
                  style={{
                    data:   { stroke:'#0F1121', strokeWidth:2 },
                    labels: { fill:'#FFF', fontSize:6, fontWeight:'bold' }
                  }}
                />
              </Box>

              {/* Máquinas */}
              <Box width={colW} minWidth={240}>
                <Text style={styles.subtitulo}>Ocorrencias por equipamento</Text>
                <VictoryPie
                  data={maquinaData}
                  colorScale="cool"
                  labels={({datum}) => `${datum.x}\n${datum.y}`}
                  innerRadius={20}
                  labelRadius={70}
                  height={280}
                  width={250}
                  padAngle={2}
                  style={{
                    data:   { stroke:'#0F1121', strokeWidth:2 },
                    labels: { fill:'#FFF', fontSize:6, fontWeight:'bold' }
                  }}
                />
              </Box>
            </HStack>
          </ScrollView>

          
        </VStack>
      </ScrollView>
    </NativeBaseProvider>
  );
}

const styles = StyleSheet.create({
  titulo: {
    color: '#FFF',
    fontSize: 35,
    fontWeight: 'bold',
    textAlign: 'center'
  },
  subtitulo: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: '-10%',
    textAlign: 'center'
  },
  botaoPrimario: {
    backgroundColor: '#EF233C',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8
  },
  botaoSecundario: {
    backgroundColor: '#282A45',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8
  },
  textoBotao: {
    color: '#FFF',
    fontWeight: 'bold'
  },
  botaoBusca: {
    backgroundColor: '#EF233C',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10
  },
  textoBotaoBusca: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 14
  }
});