const sampleCourses = [
  {
    code: "CS 245",
    title: "Logic and Computation",
    units: 0.5,
    description: "Logic, proofs, and formal reasoning.",
  },
  {
    code: "CS 246",
    title: "Object-Oriented Software Development",
    units: 0.5,
    description: "Software design and development in C++.",
  },
  {
    code: "MATH 239",
    title: "Introduction to Combinatorics",
    units: 0.5,
    description: "Counting, graphs, and combinatorial structures.",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-slate-800 px-8 py-5">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <h1 className="text-xl font-bold">
            Termwise
          </h1>

          <nav className="flex gap-6 text-sm text-slate-300">
            <a href="/">Courses</a>
            <a href="/planner">My Planner</a>
          </nav>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-8 py-12">
        <p className="text-sm text-blue-400">
          YOUR ACADEMIC WORKSPACE
        </p>

        <h2 className="mt-3 text-4xl font-bold">
          Plan your next term.
        </h2>

        <p className="mt-3 max-w-xl text-slate-400">
          Explore courses, build schedules, and compare
          alternative academic plans.
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {sampleCourses.map((course) => (
            <article
              key={course.code}
              className="rounded-xl border border-slate-800
                bg-slate-900 p-6"
            >
              <p className="text-sm text-blue-400">
                {course.code}
              </p>

              <h3 className="mt-2 font-semibold">
                {course.title}
              </h3>

              <p className="mt-3 text-sm text-slate-400">
                {course.description}
              </p>

              <p className="mt-5 text-sm text-slate-300">
                {course.units} units
              </p>
            </article>
          ))}
        </div>
        
      </section>
    </main>
  );
}