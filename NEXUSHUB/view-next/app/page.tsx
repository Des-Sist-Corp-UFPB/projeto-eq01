import { buscarProjetos } from "@/lib/api";

export default async function Home() {
  const projetos = await buscarProjetos();

  return (
    <main className="page">
      <section className="hero">
        <p className="eyebrow">A vida academica em movimento</p>
        <h1>NEXUS HUB</h1>
        <p>
          Plataforma academica gamificada para centralizar projetos, grupos,
          eventos e oportunidades em um unico ambiente.
        </p>
      </section>

      <section className="cards">
        <article>
          <span>Model</span>
          <h2>Projetos, grupos e oportunidades</h2>
          <p>Dominio da aplicacao com entidades, repositorios, DTOs e servicos.</p>
        </article>
        <article>
          <span>View</span>
          <h2>Interface Next.js</h2>
          <p>Experiencia visual para alunos, professores e grupos academicos.</p>
        </article>
        <article>
          <span>Controller</span>
          <h2>API Spring Boot</h2>
          <p>Controllers REST para conectar a view ao model.</p>
        </article>
      </section>

      <section>
        <h2>Projetos em destaque</h2>
        <div className="project-list">
          {projetos.map((projeto) => (
            <article className="project" key={projeto.id}>
              <span>{projeto.categoria || "Geral"}</span>
              <h3>{projeto.titulo}</h3>
              <p>{projeto.descricao}</p>
              <strong>{projeto.pontos} pts</strong>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
