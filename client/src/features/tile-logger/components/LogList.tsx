import { LogItem } from './LogItem'

export const LogList = () => {
  // if (/* if logs are empty then show this message */) {
  //   return (
  //     <div className="text-xs text-gray-400 py-2">No hay registros aún</div>
  //   )
  // }

  return (
    <ul className="flex flex-col px-2 max-h-72 overflow-auto">
      <LogItem />
      <LogItem />
    </ul>
  )
}
