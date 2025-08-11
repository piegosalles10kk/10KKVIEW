import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import View from "./tabs/View";
import Chamados from "./tabs/Chamados";
import Home from "./tabs/Home";
import RelatorioMesScreen from "./tabs/RelatorioMesScreen";
import LogOcorrencia from "./tabs/Log";

const Stack = createNativeStackNavigator();

const linking = {
  prefixes: ["http://localhost:8081"],
  config: {
    screens: {
      Home: "",
      View: "view",
      Chamados: "Chamados",
      Relatorio: "relatorio",
      RelatorioMes: "relatorio/mes/:mesAno",
      LogOcorrencia: "LogOcorrencia"
    },
  },
};

export default function MyStack() {
  return (
    <NavigationContainer linking={linking}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Home" component={Home} />
        <Stack.Screen name="Relatorio" component={View} />
        <Stack.Screen name="View" component={View} />
        <Stack.Screen name="Chamados" component={Chamados} />
        <Stack.Screen name="RelatorioMes" component={RelatorioMesScreen}/>
        <Stack.Screen name="LogOcorrencia" component={LogOcorrencia} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

