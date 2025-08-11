import api from "./api";

export async function pegarDados(maquina: string){
    try {
        const resultado = await api.get(`/${maquina}`, {
          headers: {},
        });
        return resultado.data;
    }catch(error){
        console.log(error);
        return null
    }
}

export async function pegarNomeDasMaquinas(){
    try {
        const resultado = await api.get(`/dados/maquinas`, {
          headers: {},
        });
        return resultado.data;
    }catch(error){
        console.log(error);
        return null
    }
}

export async function pegarLogDasMaquinas(machine_alias: string, dataOcorencia: string, ocorrenciaSelecionada: string, ocorrenciaTexto: string) {
  try {
    const tipoDeOcorrencia = `${ocorrenciaSelecionada}: ${ocorrenciaTexto}`
    const resultado = await api.post('/dados/log', {
      machine_alias,
      dataOcorencia,
      tipoDeOcorrencia
    });
    return resultado.data;
  } catch (error) {
    console.log(error);
    return null;
  }
}

export async function relatorioMes(mes: string){
    try {
        const resultado = await api.get(`relatorio/mes/${mes}`, {
          headers: {},
        });
        return resultado.data;
    }catch(error){
        console.log(error);
        return null
    }
}