import { Plus } from "lucide-react";
import type { ArchitectureEdge, ArchitectureGroup, ArchitectureNode } from "../../types/architecture";
import { AddEdgeForm } from "./AddEdgeForm";
import { PropertiesBrand } from "./Brand";
import { EdgeForm } from "./EdgeForm";
import { GroupForm } from "./GroupForm";
import { GroupsList } from "./GroupsList";
import { NodeForm } from "./NodeForm";
import { SuggestionsList } from "./SuggestionsList";

type Props = {
  selectedNode?: ArchitectureNode;
  selectedEdge?: ArchitectureEdge;
  selectedGroup?: ArchitectureGroup;
  nodes: ArchitectureNode[];
  groups: ArchitectureGroup[];
  suggestions: string[];
  onNodeChange: (node: ArchitectureNode) => void;
  onDeleteNode: (nodeId: string) => void;
  onDeleteEdge: (edgeId: string) => void;
  onUpdateEdge: (edge: ArchitectureEdge) => void;
  onAddNode: () => void;
  onAddEdge: (source: string, target: string) => void;
  onRenameGroup: (groupId: string, label: string) => void;
  onUpdateGroupColor: (groupId: string, color: string) => void;
  onDeleteGroup: (groupId: string) => void;
};

export function PropertiesPanel(props: Props) {
  const { selectedNode, selectedEdge, selectedGroup, nodes, groups, suggestions } = props;
  return (
    <aside className="right-panel">
      <PropertiesBrand />

      <section className="panel-section">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="panel-title">Component</h2>
          <button className="icon-command" onClick={props.onAddNode} title="Add node">
            <Plus size={16} />
          </button>
        </div>
        {selectedNode ? (
          <NodeForm node={selectedNode} groups={groups} onChange={props.onNodeChange} onDelete={props.onDeleteNode} />
        ) : selectedGroup ? (
          <GroupForm
            group={selectedGroup}
            onRename={props.onRenameGroup}
            onColorChange={props.onUpdateGroupColor}
            onDelete={props.onDeleteGroup}
          />
        ) : selectedEdge ? (
          <EdgeForm edge={selectedEdge} onDelete={props.onDeleteEdge} onChange={props.onUpdateEdge} />
        ) : (
          <p className="empty-copy">Select a component or relationship to edit it.</p>
        )}
      </section>

      <section className="panel-section">
        <h2 className="panel-title mb-3">Add relationship</h2>
        {selectedNode ? (
          <AddEdgeForm selectedNode={selectedNode} nodes={nodes} onAddEdge={props.onAddEdge} />
        ) : (
          <p className="empty-copy">Select a source component first.</p>
        )}
      </section>

      <section className="panel-section">
        <h2 className="panel-title mb-3">Groups</h2>
        <GroupsList groups={groups} onRename={props.onRenameGroup} />
      </section>

      <section className="panel-section">
        <h2 className="panel-title mb-3">Polish Suggestions</h2>
        <SuggestionsList suggestions={suggestions} />
      </section>
    </aside>
  );
}
