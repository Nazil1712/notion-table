import { RevoGrid } from "@revolist/react-datagrid";
import { users } from "./data";
import { columns } from "./columns";

export default function App() {
  return (
    <div className="p-6 h-screen bg-gray-50">
      <div className="h-125 bg-white rounded-xl shadow">
        <RevoGrid
          source={users}
          columns={columns}
          rowHeaders
          resize
          filter
          theme="material"
        />
      </div>
    </div>
  );
}
