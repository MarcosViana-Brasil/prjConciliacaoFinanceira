import { Activity, FileText, Landmark, Scale, ShieldCheck } from 'lucide-react';

const cards = [
  {
    title: 'Titulos',
    description: 'Base interna preparada para cadastro e importacao.',
    icon: FileText
  },
  {
    title: 'Recebiveis Rede',
    description: 'Modulo reservado para payloads e normalizacao futura.',
    icon: Landmark
  },
  {
    title: 'Conciliacao',
    description: 'Estrutura pronta para score, divergencias e revisao.',
    icon: Scale
  },
  {
    title: 'Auditoria',
    description: 'Rastreabilidade planejada para eventos financeiros.',
    icon: ShieldCheck
  }
];

export default function Home() {
  return (
    <main className="min-h-screen bg-surface text-ink">
      <section className="mx-auto flex min-h-screen w-full max-w-6xl flex-col justify-center px-6 py-10">
        <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-accent">FIP Core MVP</p>
            <h1 className="mt-3 text-4xl font-semibold tracking-normal md:text-5xl">FIP Core MVP</h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
              Plataforma modular para conciliacao financeira, iniciando pela preparacao tecnica para o
              Gateway Rede/Itau.
            </p>
          </div>

          <div className="flex w-full items-center gap-3 rounded-md border border-emerald-200 bg-white px-4 py-3 shadow-sm md:w-auto">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 text-accent">
              <Activity aria-hidden="true" size={20} />
            </span>
            <div>
              <p className="text-sm font-semibold">Plataforma online</p>
              <p className="text-sm text-slate-500">Fundacao tecnica carregada</p>
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {cards.map((card) => {
            const Icon = card.icon;

            return (
              <article key={card.title} className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-md bg-slate-100 text-accent">
                  <Icon aria-hidden="true" size={22} />
                </div>
                <h2 className="text-lg font-semibold">{card.title}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">{card.description}</p>
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}

