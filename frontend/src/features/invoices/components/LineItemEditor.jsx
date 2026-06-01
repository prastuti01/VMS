import { Plus, Trash2 } from "lucide-react";
import { formatCurrency, toNumber } from "../utils/formatters";

function LineItemEditor({ items, parts, onAdd, onRemove, onChange }) {
  return (
    <div className="line-items">
      <div className="line-items-header">
        <h3>Parts</h3>

        <button className="ghost-button" type="button" onClick={onAdd}>
          <Plus size={18} />
          Add
        </button>
      </div>

      {items.map((item, index) => (
        <div className="line-item" key={`${index}-${item.partId}`}>
          <label>
            Part
            <select
              value={item.partId}
              onChange={(event) =>
                onChange(index, "partId", event.target.value)
              }
              required
            >
              <option value="">Select Part</option>

              {parts?.map((part) => (
                <option key={part.partId} value={part.partId}>
                  {part.name}
                </option>
              ))}
            </select>
          </label>

          <label>
            Quantity
            <input
              value={item.quantity}
              onChange={(event) =>
                onChange(index, "quantity", event.target.value)
              }
              inputMode="numeric"
              min="1"
              required
            />
          </label>

          <label>
            Unit Price
            <input
              value={item.unitPrice}
              onChange={(event) =>
                onChange(index, "unitPrice", event.target.value)
              }
              inputMode="decimal"
              required
            />
          </label>

          <div className="line-total">
            <span>Total</span>

            <strong>
              {formatCurrency(
                toNumber(item.quantity) * toNumber(item.unitPrice),
              )}
            </strong>
          </div>

          <button
            className="icon-button danger"
            type="button"
            onClick={() => onRemove(index)}
            aria-label="Remove part"
          >
            <Trash2 size={18} />
          </button>
        </div>
      ))}
    </div>
  );
}

export default LineItemEditor;
