/**
 * Course catalog — lists available courses.
 */

import Link from "next/link";

const courses = [
  {
    slug: "prompt-engineering",
    title: "Prompt Engineering",
    description:
      "Maîtrisez l'art de communiquer avec les LLM. 5 modules, 10 missions pratiques, et ELLA comme coach.",
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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      <h1 className="font-heading text-3xl text-ella-gray-900 mb-2">
        Nos cours
      </h1>
      <p className="text-ella-gray-700 mb-10">
        Choisis un parcours et apprends avec ELLA à ton rythme.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {courses.map((course) => (
          <Link
            key={course.slug}
            href={course.available ? `/courses/${course.slug}` : "#"}
            className={course.available ? "" : "pointer-events-none"}
          >
            <div className="ella-card h-full">
              {course.badge && (
                <span className="inline-block bg-ella-coral-50 text-ella-coral-600 text-xs font-medium px-2.5 py-1 rounded-md mb-3">
                  {course.badge}
                </span>
              )}
              <h2 className="font-heading text-xl text-ella-gray-900 mb-2">
                {course.title}
              </h2>
              <p className="text-sm text-ella-gray-700 leading-relaxed mb-4">
                {course.description}
              </p>
              <div className="flex flex-wrap gap-3 text-xs text-ella-gray-500">
                <span className="bg-ella-gray-100 px-2.5 py-1 rounded-md">
                  {course.modules} modules
                </span>
                <span className="bg-ella-gray-100 px-2.5 py-1 rounded-md">
                  {course.labs} missions
                </span>
                <span className="bg-ella-gray-100 px-2.5 py-1 rounded-md">
                  {course.level}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
