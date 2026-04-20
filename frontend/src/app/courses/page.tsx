/**
 * Course catalog — lists available courses.
 */

import Link from "next/link";

const courses = [
  {
    slug: "prompt-engineering",
    title: "Prompt Engineering",
    description:
      "Maîtrisez l'art de communiquer avec les LLM. 5 modules, 10 missions pratiques, et Ella comme coach.",
    modules: 5,
    labs: 10,
    level: "Débutant → Avancé",
    badge: "Nouveau",
    available: true,
  },
  {
    slug: "reinforcement-learning",
    title: "Reinforcement Learning",
    description:
      "Explorez les algorithmes RL avec des labs interactifs : Policy Evaluation, Value Iteration, Q-Learning.",
    modules: 4,
    labs: 4,
    level: "Intermédiaire",
    badge: null,
    available: true,
  },
];

export default function CourseCatalog() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-ella-gray-900 mb-2">
          Nos parcours d'apprentissage
        </h1>
        <p className="text-ella-gray-700">
          Choisis un parcours et apprends avec Ella à ton rythme.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {courses.map((course) => (
          <Link
            key={course.slug}
            href={course.available ? `/courses/${course.slug}` : "#"}
            className={`group transition-transform active:scale-[0.98] ${course.available ? "" : "pointer-events-none opacity-80"}`}
          >
            <div className="bg-white rounded-xl overflow-hidden border border-ella-gray-200 shadow-sm transition-all group-hover:shadow-md group-hover:border-ella-primary/30 h-full flex flex-col">
              {/* Card Header Band */}
              <div className={`h-2 ${course.slug === 'prompt-engineering' ? 'bg-ella-primary' : 'bg-ella-accent'}`}></div>
              
              <div className="p-6 flex flex-col flex-1">
                <div className="flex justify-between items-start mb-3">
                  <h2 className="text-xl font-bold text-ella-gray-900 group-hover:text-ella-primary transition-colors">
                    {course.title}
                  </h2>
                  {course.badge && (
                    <span className="bg-ella-accent text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-tighter">
                      {course.badge}
                    </span>
                  )}
                </div>
                
                <p className="text-sm text-ella-gray-700 leading-relaxed mb-6">
                  {course.description}
                </p>

                <div className="mt-auto flex items-center justify-between pt-4 border-t border-ella-gray-100">
                  <div className="flex gap-4 text-xs font-medium text-ella-gray-500">
                    <span className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-ella-primary/40"></span>
                      {course.modules} modules
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-ella-primary/40"></span>
                      {course.labs} missions
                    </span>
                  </div>
                  <span className="text-xs font-bold text-ella-primary px-2 py-1 bg-ella-primary-bg rounded">
                    {course.level}
                  </span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
