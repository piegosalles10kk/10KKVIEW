import React, { useState, useEffect } from 'react';
import { Text, TouchableOpacity, Dimensions, StyleSheet } from 'react-native';
import { VStack, HStack } from 'native-base';
import { LineChart, ProgressChart } from 'react-native-chart-kit';

const screenWidth = Dimensions.get('window').width;

// Configuração dos gráficos
const chartConfig = {
    backgroundGradientFrom: "#2B2D42",
    backgroundGradientTo: "#2B2D42",
    decimalPlaces: 1,
    color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
};

// Função para definir cor baseada nos valores
const getColor = (value) => {
    return value <= 40 ? "#20C20E" : value <= 60 ? "#E0B100" : "#D32F2F";
};

const CardMonitoramento = ({ name, hostname, cpuName, cpuTemp, cpuUso, gpuName, gpuTemp, gpuUso, ramUso, ramTotal, ramEmUso, ramData, armazenamentoUso, armazenamentoTotal, armazenamentoEmUso, cpuData, gpuData, onRemove, dataLigada, data }) => {
    return (
        <VStack bg="#2B2D42" p={3} m={2} borderRadius="10" width={screenWidth * 0.3} alignItems="center">            

            {/* Botão de Remover */}
            <TouchableOpacity style={styles.botaoRemover} onPress={onRemove}>
                <Text style={styles.botaoTexto}>✖</Text>
            </TouchableOpacity>

            <VStack space={1} alignItems="center" marginTop='5%'>
                {/* Nome e Hostname com Limitação de Tamanho */}
                <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#FFF', textAlign: 'center', alignSelf: 'flex-start' }}>{name}</Text>
                <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#FFF', textAlign: 'center', alignSelf: 'flex-end', position: 'absolute' }}>{hostname}</Text>

                {/* Informações de Ram */}
                <HStack justifyContent="space-between" alignItems="center" width="100%">
                    <Text style={{color: '#FFF', textAlign: 'left'}}>{cpuName}</Text>

                    <HStack space={1} alignItems="center">
                        <Text style={{ fontSize: 24, fontWeight: 'bold', color: getColor(cpuTemp), textAlign: 'center' }}>{cpuTemp}°C</Text>
                        <Text style={{ fontSize: 24, fontWeight: 'bold', color: "white", textAlign: 'center' }}> | </Text>
                        <Text style={{ fontSize: 24, fontWeight: 'bold', color: getColor(cpuUso), textAlign: 'center' }}>{cpuUso}%</Text>
                    </HStack>
                </HStack>

                <LineChart
                    data={{ labels: Array(cpuData.length).fill(""), datasets: [{ data: cpuData }] }}
                    width={screenWidth * 0.28}
                    height={80}
                    yAxisSuffix="%"
                    chartConfig={chartConfig}
                    bezier
                    fromZero
                    fromNumber={100}
                />

                {/* Informações da CPU */}
                <HStack justifyContent="space-between" alignItems="center" width="100%">
                    <Text style={{color: '#FFF', textAlign: 'left'}}>Memória RAM</Text>

                    <HStack space={1} alignItems="center">
                        <Text style={{ fontSize: 24, fontWeight: 'bold', color: getColor(ramUso), textAlign: 'center' }}>{ramEmUso}GB</Text>
                        <Text style={{ fontSize: 24, fontWeight: 'bold', color: "white", textAlign: 'center' }}> | </Text>
                        <Text style={{ fontSize: 24, fontWeight: 'bold', color: 'white', textAlign: 'center' }}>{ramTotal}GB</Text>
                        <Text style={{ fontSize: 24, fontWeight: 'bold', color: "white", textAlign: 'center' }}> | </Text>
                        <Text style={{ fontSize: 24, fontWeight: 'bold', color: getColor(ramUso), textAlign: 'center' }}>{ramUso}%</Text>

                    </HStack>
                </HStack>

                <LineChart
                    data={{ labels: Array(ramData.length).fill(""), datasets: [{ data: ramData }] }}
                    width={screenWidth * 0.28}
                    height={80}
                    yAxisSuffix="%"
                    chartConfig={chartConfig}
                    bezier
                    fromZero
                    fromNumber={100}
                />
            </VStack>

        

            {/* Tempo de atividade e Data */}
            <HStack justifyContent="space-between" width="100%" marginTop='5%'>
                <Text style={styles.textoLimitado}>Tempo de atividade: {dataLigada}h</Text>
                <Text style={styles.textoLimitado}>{data}</Text>
            </HStack>
        </VStack>
    );
};

const styles = StyleSheet.create({
    botaoRemover: {
        marginTop: 5,
        backgroundColor: '#D32F2F',
        padding: 5,
        borderRadius: 5,
        alignSelf: 'flex-end'
    },
    botaoTexto: {
        color: '#FFF',
        fontWeight: 'bold',
    },
    textoLimitado: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#FFF',
        textAlign: 'center',
        width: '100%',
        numberOfLines: 1,
        ellipsizeMode: 'tail'
    },
    labelGrafico: {
        fontSize: 9,
        color: '#FFF',
        textAlign: 'center'
    }
});

export default CardMonitoramento;