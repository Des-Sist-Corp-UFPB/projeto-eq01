export type Projeto = {
  id: number;
  titulo: string;
  descricao: string;
  categoria: string | null;
  responsavel: string | null;
  status: string;
  pontos: number;
  criadoEm: string;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export async function buscarProjetos(): Promise<Projeto[]> {
  try {
    const response = await fetch(`${API_URL}/api/projetos`, {
      next: { revalidate: 30 }
    });

    if (!response.ok) {
      return [];
    }

    return response.json();
  } catch {
    return [];
  }
}
