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