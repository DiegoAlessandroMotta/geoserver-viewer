export const LogItem = () => {
  return (
    <li className="py-2 flex flex-col border-b last:border-b-0 border-b-gray-300">
      <div className="flex gap-2">
        <span className="text-xs font-medium bg-cyan-100 text-cyan-700 rounded py-0.5 px-1">
          {/* show real log timestamp */}
          {new Date().toLocaleTimeString()}
        </span>
        <span className="text-xs font-medium bg-indigo-100 text-indigo-700 rounded py-0.5 px-1">
          {/* show real tile log workspace */}
          cartografia_workspace
        </span>
        {/* render each badge depending on the cache result for the tile log */}
        <span className="text-xs font-medium bg-gray-100 text-gray-600 rounded py-0.5 px-1">
          no cache
        </span>
        <span className="text-xs font-medium bg-green-100 text-green-700 rounded py-0.5 px-1">
          cache
        </span>
      </div>

      <div>
        <span className="text-xs font-semibold text-gray-800">
          {/* show real layer name and tile position (z,x,y)*/}
          DEPARTAMENTO (14,4681,7638)
        </span>
      </div>
    </li>
  )
}
