// tabs/RelatorioMesScreen.js

import React, { useEffect, useState, useRef } from 'react';
import {
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
  View
} from 'react-native';
import {
  NativeBaseProvider,
  VStack,
  HStack,
  Text,
  Box,
  Spinner
} from 'native-base';
import { VictoryPie } from 'victory';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import html2pdf from 'html2pdf.js';


export default function RelatorioMesScreen({ route }) {
  const { mesAno } = route.params;       // ex: "06-2025"
  const [dados, setDados] = useState([]);
  const [loading, setLoading] = useState(true);
  const { width } = useWindowDimensions();
  const pdfRef = useRef(null);

  useEffect(() => {
    fetch(`http://10.10.10.61:2500/relatorio/mes/${mesAno}`)
      .then(r => r.json())
      .then(json => {
        setDados(json);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [mesAno]);

  // agrupa dados para gráficos
  const tipoCount = {};
  const maquinaCount = {};
  dados.forEach(item => {
    // conta +1 para cada ocorrência
    Object.keys(item.ocorrencia).forEach(tipo => {
      tipoCount[tipo] = (tipoCount[tipo] || 0) + 1;
    });
    // conta +1 para cada máquina
    const m = item.maquina.toUpperCase();
    maquinaCount[m] = (maquinaCount[m] || 0) + 1;
  });
  const dataTipo    = Object.entries(tipoCount).map(([x,y])=>({ x,y }));
  const dataMaquina = Object.entries(maquinaCount).map(([x,y])=>({ x,y }));

  // larguras responsivas
  const leftW  = width > 900 ? width * 0.55 : width;
  const rightW = width > 900 ? width * 0.4  : width;

  // captura e exporta PDF via html2canvas + jsPDF
 const handleExportPDF = async () => {
  const element = pdfRef.current;

  // aumenta temporariamente a escala visual
  element.style.transform = 'scale(1.2)';
  element.style.transformOrigin = 'top left';

  // aguarda render com escala
  await new Promise((res) => setTimeout(res, 600));

  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    backgroundColor: '#ffffff',
  });

  // volta à escala original
  element.style.transform = '';
  element.style.transformOrigin = '';

  const imgData = canvas.toDataURL('image/jpeg', 1.0);
  const pdf = new jsPDF('p', 'pt', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const imgWidth = canvas.width;
  const imgHeight = canvas.height;
  const ratio = pageWidth / imgWidth;
  const scaledHeight = imgHeight * ratio;

  let position = 0;
  while (position < scaledHeight) {
    pdf.addImage(imgData, 'JPEG', 0, -position, pageWidth, scaledHeight);
    position += pageHeight;
    if (position < scaledHeight) pdf.addPage();
  }

  pdf.save(`relatorio_${mesAno}.pdf`);
};

  return (
    <NativeBaseProvider>

    <VStack bg='#0F1121'             
            borderBottomWidth={4}
            borderBottomColor='#EF233C'
            borderBottomRadius={10}>

        {/* Botão Exportar PDF */}
                <TouchableOpacity
                  style={styles.exportButton}
                  onPress={handleExportPDF}
                >
                  <Text style={styles.exportText}>  Exportar como PDF  </Text>
                </TouchableOpacity>
    </VStack>
        
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* Conteúdo a ser capturado no PDF */}
                <View
                  ref={pdfRef}
                  collapsable={false}
                  style={[styles.pdfContainer, { minHeight: 1000 }]} // força altura mínima visível
                >
        <VStack space={4} padding={1} alignItems='center'>

            

          {loading
            ? <Spinner color="white" size="lg" alignSelf="center" mt={20} />
            : (
              <>
                
                  {/* Título incluído no PDF */}
                  <Text style={styles.title}>
                    Histórico {mesAno.replace('-', '/')}
                  </Text>

                  <Text textAlign='start' mb='5%'>Este relatório foi elaborado com base nos dados de anomalias coletados ao longo do mês <strong>{mesAno.replace('-', '/')}</strong>.<br/> 
                  Durante o periodo, <strong>{dados.length} ocorrencias</strong> foram registradas. O gráfico a seguir apresenta, de forma visual, as <br/>
                  principais máquinas afetadas e os tipos de anomalias detectadas.<br/>
                  
                  </Text>

                    {/* Gráficos de Pizza */}
                  <HStack alignItems='center'>
                      <Box>
                        <Text style={styles.subTitle}>Anomalias</Text>
                        <VictoryPie
                          data={dataTipo}
                          colorScale={["#00CED1","#20B2AA","#87CEEB","#FFD700","#FF6347"]}
                          labels={({ datum }) => `${datum.x}\n${datum.y}`}
                          innerRadius={30}
                          labelRadius={60}
                          height={300}
                          style={{
                            data:   { stroke:'#0F1121', strokeWidth:2 },
                            labels: { fill:'#000', fontSize:10, fontWeight:'bold' }
                          }}
                        />
                      </Box>
                      <Box>
                        <Text style={styles.subTitle}>Máquinas</Text>
                        <VictoryPie
                          data={dataMaquina}
                          colorScale={["#00CED1","#20B2AA","#87CEEB","#FFD700","#FF6347"]}
                          labels={({ datum }) => `${datum.x}\n${datum.y}`}
                          innerRadius={30}
                          labelRadius={60}
                          height={300}
                          style={{
                            data:   { stroke:'#0F1121', strokeWidth:2 },
                            labels: { fill:'#000', fontSize:10, fontWeight:'bold' }
                          }}
                        />
                      </Box>
                    </HStack>

                          <Text bold fontSize='xl'>Lista de anomalias identificadas</Text>
                  <HStack space={4} flexWrap="wrap">
                    {/* Lista de Chamados */}
                    <Box width={leftW}>
                      <ScrollView showsVerticalScrollIndicator={false}>
                        {dados.map((item, i) => (
                          <VStack key={i} style={styles.card} space={2}>
                            <HStack justifyContent="space-between">
                              <Text style={styles.cardTitle}>
                                {item.maquina}
                              </Text>
                              <Text style={styles.timestamp}>
                                {new Date(item.horario).toLocaleString()}
                              </Text>
                            </HStack>
                            <Box style={styles.divider} />
                            {Object.entries(item.ocorrencia).map(([t, v]) => (
                              <Text key={t} style={styles.ocorrenciaItem}>
                                • {t}: <Text style={styles.ocorrenciaValue}>{v}</Text>
                              </Text>
                            ))}
                          </VStack>
                        ))}
                      </ScrollView>
                    </Box>

                    
                    
                  </HStack>
                

                
              </>
            )}
        </VStack>
        </View>
      </ScrollView>
      
    </NativeBaseProvider>
  );
}

const styles = StyleSheet.create({
  container:     { backgroundColor: '#fff' },
  pdfContainer:  { backgroundColor: '#fff', padding: 8 },
  title:         { color:'#000', fontSize:36, fontWeight:'bold', textAlign:'center', marginBottom:'2%' },
  subTitle:      { color:'#000', fontSize:18, fontWeight:'bold', textAlign:'center', marginBottom:'-5%' },

  card1:          { backgroundColor:'#2A2F4A', borderRadius:8, padding:12, marginBottom:12 },
  cardTitle1:     { color:'#FFF', fontSize:16, fontWeight:'bold' },
  timestamp1:     { color:'#BBB', fontSize:12 },
  divider1:       { height:1, backgroundColor:'#444', marginVertical:6 },
  ocorrenciaItem1:{ color:'#EEE', fontSize:14 },
  ocorrenciaValue1:{ color:'#FFD700', fontWeight:'bold' },

  exportButton:  { backgroundColor:'#EF233C', paddingVertical:12, borderRadius:8, alignItems:'center', marginTop:16, width:'20%', alignSelf:'center', marginBottom:16 },
  exportText:    { color:'#FFF', fontWeight:'bold', fontSize:16 },

  card:          { backgroundColor:'#FFF', borderRadius:8, padding:12, marginBottom:12, borderWidth:2 },
  cardTitle:     { color:'#000', fontSize:16, fontWeight:'bold' },
  timestamp:     { color:'#000', fontSize:12 },
  divider:       { height:1, backgroundColor:'#444', marginVertical:6 },
  ocorrenciaItem:{ color:'#000', fontSize:14 },
  ocorrenciaValue:{ color:'red', fontWeight:'bold' },

});