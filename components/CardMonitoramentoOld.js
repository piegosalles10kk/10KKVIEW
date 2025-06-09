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

const CardMonitoramento = ({ name, hostname, cpuName, cpuTemp, cpuUso, gpuName, gpuTemp, gpuUso, ramUso, ramTotal, ramEmUso, armazenamentoUso, armazenamentoTotal, armazenamentoEmUso, cpuData, gpuData , onRemove, dataLigada, data }) => {
    return (
        <VStack bg="#2B2D42" p={4} m={3} borderRadius="10" width={screenWidth * 0.4} alignItems="center">
            
            {/* Botão de Remover */}
            <TouchableOpacity style={styles.botaoRemover} onPress={onRemove}>
                <Text style={styles.botaoTexto}>✖</Text>
            </TouchableOpacity>

            <VStack space={2} alignItems="center" marginTop='5%'>
                <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#FFF', textAlign: 'center', alignSelf: 'flex-start' }}>{name}</Text>
                <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#FFF', textAlign: 'center', alignSelf: 'flex-end', position: 'absolute' }}>{hostname}</Text>
                <HStack justifyContent="space-between" alignItems="center" width="100%">
                    <Text style={{ fontSize: 16, color: '#FFF', textAlign: 'left' }}>{cpuName}</Text>

                    <HStack space={2} alignItems="center">
                        <Text style={{ fontSize: 30, fontWeight: 'bold', color: getColor(cpuTemp), textAlign: 'center' }}>{cpuTemp}°C</Text>
                        <Text style={{ fontSize: 30, fontWeight: 'bold', color: "white", textAlign: 'center' }}> | </Text>
                        <Text style={{ fontSize: 30, fontWeight: 'bold', color: getColor(cpuUso), textAlign: 'center' }}>{cpuUso}%</Text>
                    </HStack>
                </HStack>

                <LineChart
                    data={{ labels: Array(cpuData.length).fill(""), datasets: [{ data: cpuData }] }}
                    width={screenWidth * 0.35}
                    height={100}
                    yAxisLabel=""
                    yAxisSuffix="%"
                    chartConfig={chartConfig}
                    bezier
                    fromNumber={100}
                />
            </VStack>

            <VStack space={2} alignItems="center">
                <HStack justifyContent="space-between" alignItems="center" width="100%">
                    <Text style={{ fontSize: 16, color: '#FFF', textAlign: 'left' }}>{gpuName}</Text>

                    <HStack space={2} alignItems="center">
                        <Text style={{ fontSize: 30, fontWeight: 'bold', color: getColor(cpuTemp), textAlign: 'center' }}>{gpuTemp}°C</Text>
                        <Text style={{ fontSize: 30, fontWeight: 'bold', color: "white", textAlign: 'center' }}> | </Text>
                        <Text style={{ fontSize: 30, fontWeight: 'bold', color: getColor(cpuUso), textAlign: 'center' }}>{gpuUso}%</Text>
                    </HStack>
                </HStack>
                <LineChart
                    data={{ labels: Array(gpuData.length).fill(""), datasets: [{ data: gpuData }] }}
                    width={screenWidth * 0.35}
                    height={100}
                    chartConfig={chartConfig}
                    bezier
                    fromNumber={100}
                />
            </VStack>

            {/* RAM e Armazenamento */}
            <HStack space={5} alignItems="center" marginTop='5%'>
                <VStack alignItems="center">
                    <Text style={{ fontSize: 10, color: '#FFF', textAlign: 'center' }}>USO DE RAM</Text>
                    <ProgressChart
                        data={{ data: [ramUso / 100] }}
                        width={100}
                        height={100}
                        strokeWidth={8}
                        radius={32}
                        chartConfig={{
                            ...chartConfig,
                            color: (opacity = 1) => `rgba(${ramUso <= 50 ? "32, 194, 14" : ramUso <= 80 ? "224, 177, 0" : "211, 47, 47"}, ${opacity})`
                        }} 
                        
                    />
                    <Text style={{ fontSize: 10, color: '#FFF', textAlign: 'center' }}>{ramEmUso}GB  |  {ramTotal}GB</Text>


                </VStack>
                <VStack alignItems="center">
                <Text style={{ fontSize: 10, color: '#FFF', textAlign: 'center' }}>ARMAZENAMENTO</Text>

                    <ProgressChart
                        data={{ data: [armazenamentoUso / 100] }}
                        width={100}
                        height={100}
                        strokeWidth={8}
                        radius={32}
                        chartConfig={{
                            ...chartConfig,
                            color: (opacity = 1) => `rgba(${armazenamentoUso <= 50 ? "32, 194, 14" : armazenamentoUso <= 80 ? "224, 177, 0" : "211, 47, 47"}, ${opacity})`
                        }} 

                    />
                    <Text style={{ fontSize: 10, color: '#FFF', textAlign: 'center' }}>{armazenamentoEmUso}GB  |  {armazenamentoTotal}GB</Text>
                </VStack>
            </HStack>


            

                <HStack justifyContent="space-between" width="100%" marginTop='5%'>
                    <Text style={{ fontSize: 14, fontWeight: 'bold', color: 'white' }}>
                        Tempo de atividade: {dataLigada}h
                    </Text>
                    <Text style={{ fontSize: 14, fontWeight: 'bold', color: 'white' }}>
                        {data}
                    </Text>
                </HStack>
        </VStack>
    );
};

const styles = StyleSheet.create({
    botaoRemover: {
        marginTop: 10,
        backgroundColor: '#D32F2F',
        padding: 8,
        borderRadius: 5,
        alignSelf: 'flex-end'
    },
    botaoTexto: {
        color: '#FFF',
        fontWeight: 'bold',
    }
});

export default CardMonitoramento;