import React from 'react';
import { View, Text, Image } from 'react-native';

const Tarefas = ({ titulo = 'Uso de CPU', processos = [{
    nome: String,
    uso: String
}], ativo = false, numeroDeNucleos }) => {
  return (
    <View
      style={{
        width: '49%',
        padding: 2,
        alignItems: 'center',
        backgroundColor: '#1C1E35',
        borderRadius: 10,
        marginRight: '1%',
        borderWidth: ativo ? 2 : 0,
        borderColor: ativo ? '#4CAF50' : 'transparent', // Verde se ativo = true
      }}
    >
      <View style={{ width: '90%' }}>
        <Text
          style={{
            fontSize: 30,
            color: 'white',
            marginBottom: '5%',
            alignSelf: 'center',
            fontWeight: 'bold',
          }}
        >
          {titulo}
        </Text>

        {processos.map((proc, index) => (
  <View
    key={index}
    style={{
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-start',
      padding: 10,
      marginBottom: '5%',
      borderRadius: 10,
      backgroundColor: '#0F1121',
    }}
  >
    <Image
      source={{
        uri: 'https://upload.wikimedia.org/wikipedia/commons/f/f8/Windows_logo_-_2012_%28red%29.svg',
      }}
      style={{ width: 50, height: 50, marginRight: '5%' }}
    />

    <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
      {/* Nome do processo */}
      <Text style={{ color: 'white', fontSize: 13, flexShrink: 1 }}>{proc.nome}</Text>

      {/* Porcentagem — grudado à direita */}
      <View style={{ flex: 1, alignItems: 'flex-end' }}>
        <Text style={{ color: 'white', fontSize: 20, fontWeight: 'bold' }}>{proc.uso}</Text>
      </View>
    </View>
  </View>
))}

        {ativo && (
          <Text style={{ color: '#4CAF50', fontSize: 14, alignSelf: 'flex-end', marginTop: 5 }}>
            Componente ativo
          </Text>
        )}
      </View>
    </View>
  );
};

export default Tarefas;