export default function Courses({ courses, onViewCourse }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {courses.map((c) => (
        <div key={c.id} className="p-4 bg-white dark:bg-slate-900 rounded shadow">
          <div className="font-semibold">{c.title}</div>
          <div className="text-sm text-slate-500">{c.teacher}</div>
          <div className="text-xs text-slate-400 mt-2">{c.schedule}</div>
          <div className="mt-4 flex justify-end">
            <button className="px-3 py-1 border rounded" type="button" onClick={() => onViewCourse ? onViewCourse(c) : alert(`${c.title}\n${c.teacher}\n${c.schedule}`)}>Ver</button>
          </div>
        </div>
      ))}
    </div>
  )
}
