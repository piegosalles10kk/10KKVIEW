import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

const Botao = ({
  titulo = 'Confirmar', // texto padrão
  aoPressionar = () => {}, // função padrão vazia
  estiloExtra = {}, // estilo adicional opcional
  corTexto = '#fff',
  corFundo = '#EF233C',
  fonteSize = 16,
}) => {
  return (
    <TouchableOpacity
      style={[styles.button, { backgroundColor: corFundo }, estiloExtra]}
      onPress={aoPressionar}
    >
      <Text style={[styles.buttonText, { color: corTexto, fontSize: fonteSize }]}>
        {titulo}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  buttonText: {
    fontWeight: 'bold',
  },
});

export default Botao;