type Props = {
  x: number;
  y: number;
  columnId?: string;
  onClose: () => void;
  gridRef: React.RefObject<any>;
};

export function ColumnContextMenu({
  x,
  y,
  columnId,
  onClose,
  gridRef,
}: Props) {
  const grid = gridRef.current;

  console.log("I am inside Column Context Menu")

  const sortAsc = () => {
    grid?.sortColumn(columnId, "asc");
    onClose();
  };

  const sortDesc = () => {
    grid?.sortColumn(columnId, "desc");
    onClose();
  };

  const freezeColumn = () => {
    grid?.updateColumns((cols: any[]) =>
      cols.map(c =>
        c.prop === columnId ? { ...c, pin: "left" } : c
      )
    );
    onClose();
  };

  return (
    <div
      style={{ top: y, left: x }}
      className={`absolute z-50 w-56 rounded-lg border border-gray-300 bg-white shadow-xl text-sm`}
      onClick={(e) => e.stopPropagation()}
    >
      <MenuItem label="Sort ascending" onClick={sortAsc} />
      <MenuItem label="Sort descending" onClick={sortDesc} />

      <Divider />

      <MenuItem label="Freeze column" onClick={freezeColumn} />
      <MenuItem label="Wrap content" onClick={() => {}} />

      <Divider />

      <MenuItem label="Insert left" onClick={() => {}} />
      <MenuItem label="Insert right" onClick={() => {}} />
    </div>
  );
}

const MenuItem = ({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) => (
  <div
    className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
    onClick={onClick}
  >
    {label}
  </div>
);

const Divider = () => <div className="my-1 h-px bg-gray-200" />;
