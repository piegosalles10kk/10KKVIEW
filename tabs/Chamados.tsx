import React, { useState } from "react";
import {
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ActivityIndicator,
  Alert,
  Image
} from "react-native";
import { NativeBaseProvider, VStack, Select } from "native-base";
import logo from "../assets/logo.png";


const Chamados = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [successModalVisible, setSuccessModalVisible] = useState(false); // Novo modal de confirmação
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    requerente: "",
    titulo: "",
    tipo: "Aberto pelo app",
    categoria: "Incidente",
    chamado: "",
  });

  const api = "http://10.10.10.61:1000";

  const handleInputChange = (name, value) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleInputChange1 = (name, value) => {
    setFormData({ ...formData, [name]: value.toUpperCase() });
  };

  const handleSubmit = async () => {
    setLoading(true);
    setModalVisible(true);

    //const data = { ...formData, to: "diegosalles@live.com" };
    const data = { ...formData, to: "chamados@bugbusters.com.br" };

    try {
      const response = await fetch(`${api}/api/enviar-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      setLoading(false);
      setModalVisible(false);

      if (response.ok) {
        setSuccessModalVisible(true); // Exibir modal de confirmação
        setFormData({ requerente: "", titulo: "", tipo: "Aberto pelo app", categoria: "Incidente", chamado: "" });
      } else {
        Alert.alert("Erro", result.message);
      }
    } catch (error) {
      setLoading(false);
      setModalVisible(false);
      Alert.alert("Erro", "Erro ao enviar e-mail.");
    }
  };

  return (
    <NativeBaseProvider>
      <VStack flex={1} alignItems="center" justifyContent="center" p={5} bg='#0F1121'>
        <ScrollView style={styles.form}>

          <Text style={styles.title}>Chamados Chromatox</Text>

          <TextInput style={styles.input} placeholder="Nome do solicitante" value={formData.requerente} onChangeText={(text) => handleInputChange1("requerente", text)} />
          <TextInput style={styles.input} placeholder="Título" value={formData.titulo} onChangeText={(text) => handleInputChange1("titulo", text)} />

          {/* Dropdown para Categoria */}
          <Select selectedValue={formData.categoria} onValueChange={(value) => handleInputChange("categoria", value)} style={styles.input}>
            <Select.Item label="Incidente" value="Incidente" />
            <Select.Item label="Requisição" value="Requisição" />
          </Select>

          <TextInput style={styles.textArea} placeholder="Resumo do Chamado" value={formData.chamado} onChangeText={(text) => handleInputChange("chamado", text)} multiline />

          <TouchableOpacity style={styles.button} onPress={handleSubmit}>
            <Text style={styles.buttonText}>Enviar</Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Modal de carregamento */}
        <Modal transparent animationType="fade" visible={modalVisible}>
          <View style={styles.modalContainer}>
            {loading ? <ActivityIndicator size="large" color="#4CAF50" /> : null}
            <Text style={styles.modalText}>{loading ? "Enviando chamado..." : ""}</Text>
          </View>
        </Modal>

        {/* Modal de confirmação após envio */}
        <Modal transparent animationType="slide" visible={successModalVisible}>
          <View style={styles.successModalContainer}>
            <Text style={styles.successModalText}>Chamado enviado com sucesso!</Text>
            <TouchableOpacity style={styles.button} onPress={() => setSuccessModalVisible(false)}>
              <Text style={styles.buttonText}>Voltar</Text>
            </TouchableOpacity>
          </View>
        </Modal>
      </VStack>
    </NativeBaseProvider>
  );
};

const styles = StyleSheet.create({
  form: { width: "90%", borderWidth: 0, borderRadius: 15, padding: 10, backgroundColor: "#0F1121", borderColor: '#EF233C' },
  logo: { width: 150, height: 150, alignSelf: "center" },
  
  title: { fontSize: 25, fontWeight: "bold", textAlign: "center", marginBottom: '6%', marginTop: '3%', color: '#fff' },
  input: { borderWidth: 0, borderRadius: 5, padding: 10, marginBottom: 15, backgroundColor: '#2A2F4A', color: '#fff' },
  textArea: { borderWidth: 0, borderRadius: 5, padding: 10, marginBottom: 15, backgroundColor: '#2A2F4A', height: 80, marginTop: '5%', color: '#fff' },

  button: { backgroundColor: "#EF233C", padding: 15, borderRadius: 5, alignItems: "center" },
  buttonText: { color: "#FFF", fontSize: 16, fontWeight: "bold" },

  modalContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#0F1121" },
  modalText: { color: "rgb(255, 255, 255)", fontSize: 20, marginTop: 10 },
  successModalContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#0F1121", padding: 20 },
  successModalText: { color: "rgb(255, 255, 255)", fontSize: 20, marginBottom: 20, textAlignVertical: 'center' },
});

export default Chamados;