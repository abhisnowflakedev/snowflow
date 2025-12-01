import { Handle, Position } from 'reactflow';
import { Brain } from 'lucide-react';

export const AgentNode = ({ data }: { data: { label: string; type: string } }) => {
  return (
    <div className="px-4 py-2 shadow-xl rounded-md bg-white border-2 border-purple-500 w-64">
      <Handle type="target" position={Position.Left} className="w-3 h-3 bg-purple-500" />
      <div className="flex items-center">
        <div className="rounded-full w-8 h-8 flex items-center justify-center bg-purple-100 mr-2">
          <Brain size={16} className="text-purple-600" />
        </div>
        <div className="ml-2">
          <div className="text-xs font-bold text-purple-500 uppercase">{data.type} Agent</div>
          <div className="text-sm font-bold">{data.label}</div>
        </div>
      </div>
      <div className="mt-2 text-xs text-gray-400 bg-gray-50 p-2 rounded">
        Instructions: Analyze incoming data...
      </div>
      <Handle type="source" position={Position.Right} className="w-3 h-3 bg-purple-500" />
    </div>
  );
};
