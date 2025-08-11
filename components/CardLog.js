import React from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { PieChart } from 'react-native-chart-kit';

const screenWidth = Dimensions.get('window').width;

const DashboardMonitoramento = ({ dados }) => {
  const monitoramento = dados?.monitoramento;
  if (!monitoramento) return null;

  const cpu = monitoramento.cpu;
  const ram = monitoramento.memoria_ram;
  const disco = monitoramento.disco_principal;
  const gpu = monitoramento.gpu;
  const rede = monitoramento.rede;
  const ips = monitoramento?.rede?.ips || {};  
  const placaMae = monitoramento.placa_mae;
  const uptime = monitoramento.uptime_horas;
  const discosAdicionais = monitoramento.discos_adicionais || [];
  

  const getCorPorNivel = (percent) => {
    if (percent <= 60) return '#4CAF50';   // verde
    if (percent <= 80) return '#FFC107';   // amarelo
    return '#F44336';                      // vermelho
  };

  const getCorTemp = (temp) => {
    return temp >= 70 ? '#F44336' : '#4CAF50';
  };

  const criarGraficoPizza = (titulo, valor) => {
    if (typeof valor !== 'number') return null;
    const corPrimaria = getCorPorNivel(valor);
    const data = [
      { name: 'Uso', population: valor, color: corPrimaria },
      { name: 'Livre', population: 100 - valor, color: '#2A2F4A' },
    ];
    return (
      <View key={titulo} style={styles.chartItem}>
        <PieChart
          data={data}
          width={150}
          height={150}
          chartConfig={chartConfig}
          accessor="population"
          backgroundColor="transparent"
          paddingLeft="30"
          hasLegend={false}
          center={[0, 0]}
        />
        <View style={styles.chartOverlay}>
          <Text style={styles.chartLabel}>{titulo}</Text>
          <Text style={styles.chartValor}>{valor}%</Text>
        </View>
      </View>
    );
  };

  const renderRecursoBox = (label, usado, total, percent) => {
    const cor = getCorPorNivel(percent);
    return (
      <View key={label} style={[styles.recursoBox, { borderColor: cor }]}>
        <Text style={styles.recursoLabel}>{label}</Text>
        <Text style={[styles.recursoValor, { color: cor }]}>
          {usado} / {total}
        </Text>
        <Text style={[styles.recursoPorcento, { color: cor }]}>{percent}%</Text>
      </View>
    );
  };

  const renderTempBox = (label, temp) => (
    <View key={label} style={[styles.tempBox, { borderColor: getCorTemp(temp) }]}>
      <Text style={styles.tempLabel}>{label}</Text>
      <Text style={[styles.tempValor, { color: getCorTemp(temp) }]}>{temp}°C</Text>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Monitoramento {dados?.machine_alias} </Text>

      {/* 🍕 Gráficos de uso */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
        {criarGraficoPizza('CPU Uso', cpu?.uso_total_percent)}
        {criarGraficoPizza('RAM Uso', ram?.percentual_uso)}
        {criarGraficoPizza('GPU Uso', gpu?.uso_percentual)}
        {criarGraficoPizza(`Disco ${disco?.particao}`, disco?.percentual_uso)}
        {discosAdicionais.map((d, i) => criarGraficoPizza(`Disco ${d?.particao}`, d?.uso_espaco_percent))}
      </ScrollView>

      {/* 📊 Uso de Recursos */}
      <Text style={styles.subTitle}>Uso de Recursos</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
        {renderRecursoBox('RAM', `${ram?.usado_gb} GB`, `${ram?.total_gb} GB`, ram?.percentual_uso)}
        {renderRecursoBox(`Disco ${disco?.particao}`, `${disco?.usado_gb} GB`, `${disco?.total_gb} GB`, disco?.percentual_uso)}
        {discosAdicionais.map((d, i) => {
          const total = d?.total_gb || 1000; // use real value if available
          const usado = ((d?.uso_espaco_percent || 0) * total / 100).toFixed(2);
          return renderRecursoBox(`Disco ${d?.particao}`, `${d?.usado_gb} GB`, `${total} GB`, d?.percentual_uso);
        })}
      </ScrollView>

      {/* 🌡️ Temperaturas */}
      <Text style={styles.subTitle}>Temperaturas</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
        {renderTempBox('CPU', cpu?.temperatura_package_celsius)}
        {renderTempBox('GPU', gpu?.temperatura_core_celsius)}
        {renderTempBox(`Disco ${disco?.particao}`, disco?.temperatura_celsius)}
        {discosAdicionais.map((d, i) =>
          renderTempBox(`Disco ${d?.particao}`, d?.temperatura_celsius)
        )}
      </ScrollView>

      {/* 🧬 Sistema */}
      <Text style={styles.subTitle}>Dados do sistema</Text>
      <View style={styles.infoCard}>

     <Text style={styles.importante} >{dados?.machine_alias}    |    {dados?.hostname}</Text>
     <Text style={[styles.info, {textDecorationLine: 'underline', textAlign: 'right'}]}>{dados?.timestamp_coleta}</Text>


        <Text style={styles.info}>Processador: {cpu?.nome}</Text>
        <Text style={styles.info}>Placa-mãe: {placaMae?.nome}</Text>
        <Text style={styles.info}>RAM Total: {ram?.total_gb} GB</Text>
        <Text style={styles.info}><br/>----------------------------------------------------------------<br/></Text>

        <View style={styles.infoItem}>
        <Text style={styles.info}>Disco {disco?.particao}       {disco?.nome}</Text>
        <Text style={styles.info}>Tipo: SSD</Text>
        <Text style={styles.info}>Armazenamento: {disco?.total_gb}GB </Text>

        </View>

        {discosAdicionais.map((d, i) => (
          <View key={i} style={styles.infoItem}>
            <Text style={styles.info}><br/><br/>Disco {d?.particao}       {d?.nome}</Text>
            <Text style={styles.info}>Tipo: HD</Text>
            <Text style={styles.info}>
              Armazenamento: {d?.total_gb || 1000} GB
            </Text>
          </View>
        ))}

        <Text style={styles.info}>----------------------------------------------------------------<br/><br/></Text>

        
        <Text style={styles.info}>Rede ↓ {rede?.bytes_recebidos_mb} MB / ↑ {rede?.bytes_enviados_mb} MB</Text>
        <Text style={styles.info}>Velocidade: {rede?.velocidade_atual_mbps} Mbps<br/><br/></Text>
        
        {Object.entries(ips).map(([nomeInterface, ip], index) => (
        <View key={index}>
          <Text style={styles.info}>{nomeInterface}: <strong>{ip}</strong></Text>
        </View>
      ))}


        <Text style={styles.info}><br/><br/>Tempo de atividade: {Math.floor(uptime)} horas</Text>
      </View>
    </ScrollView>
  );
};

const chartConfig = {
  backgroundColor: '#1C1E35',
  backgroundGradientFrom: '#1C1E35',
  backgroundGradientTo: '#1C1E35',
  color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 20,
    backgroundColor: '#0F1121',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
    textAlign: 'center',
  },
  subTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
    marginLeft: 16,
  },

  importante: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
    alignSelf: 'center',
  },

  horizontalScroll: {
    paddingHorizontal: 16,
    marginBottom: 24,
    flexDirection: 'row',
  },
  chartItem: {
    position: 'relative',
    marginHorizontal: 10,
    alignItems: 'center',
  },
  chartOverlay: {
    position: 'absolute',
    top: 35,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  chartLabel: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  chartValor: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
    recursoBox: {
    borderWidth: 2,
    borderRadius: 10,
    padding: 14,
    minWidth: 120,
    alignItems: 'center',
    marginHorizontal: 8,
  },
  recursoLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  recursoValor: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 4,
  },
  recursoPorcento: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 2,
  },
  tempBox: {
    borderWidth: 2,
    borderRadius: 10,
    padding: 14,
    minWidth: 100,
    alignItems: 'center',
    marginHorizontal: 8,
  },
  tempLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  tempValor: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 6,
  },
  infoCard: {
    backgroundColor: '#2A2F4A',
    padding: 16,
    borderRadius: 10,
    marginHorizontal: 16,
    marginBottom: 24,
  },
  infoItem: {
    marginBottom: 12,
  },
  info: {
    color: '#ccc',
    fontSize: 15,
  }
});

export default DashboardMonitoramento;