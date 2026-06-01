import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  FaBoxOpen,
  FaEdit,
  FaExclamationTriangle,
  FaTrash,
  FaTimes,
  FaWarehouse,
} from "react-icons/fa";

import {
  createPart,
  deletePartApi,
  getParts,
  getVendors,
  updatePart,
} from "../../../shared/config/api";

import "./PartsManagement.css";

const initialForm = {
  name: "",
  description: "",
  category: "",
  price: "",
  stockQuantity: "",
  vendorId: "",
};

/**
 * Props
 *  query          – search string from the topbar (controlled by AdminDashboardPage)
 *  onRegisterOpen – receives the openAddModal fn so the topbar "Add Part" button
 *                   can trigger it from outside this component
 */
export default function PartsManagement({ query = "", onRegisterOpen }) {
  const [parts, setParts] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [editingPart, setEditingPart] = useState(null);
  const [formData, setFormData] = useState(initialForm);
  const [errors, setErrors] = useState({});

  // ── expose openAddModal to the parent ───────────────────────────────────
  const openAddModal = () => {
    setEditingPart(null);
    setFormData(initialForm);
    setErrors({});
    setShowModal(true);
  };

  const registered = useRef(false);
  useEffect(() => {
    if (!registered.current && onRegisterOpen) {
      onRegisterOpen(openAddModal);
      registered.current = true;
    }
   
  }, [onRegisterOpen]);
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [partsRes, vendorsRes] = await Promise.all([
        getParts(),
        getVendors(),
      ]);
      setParts(partsRes.data);
      setVendors(vendorsRes.data);
    } catch (error) {
      console.error("Failed to load parts", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    async function init() {
      await loadData();
    }
    init();
  }, [loadData]);

  // ── filtering driven by topbar query prop ───────────────────────────────
  const filteredParts = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return parts;
    return parts.filter(
      (part) =>
        part.name.toLowerCase().includes(needle) ||
        part.category.toLowerCase().includes(needle) ||
        part.vendorName.toLowerCase().includes(needle),
    );
  }, [parts, query]);

  // ── derived stats ───────────────────────────────────────────────────────
  const totalParts = parts.length;
  const lowStockCount = parts.filter((p) => p.stockQuantity < 10).length;
  const totalStock = parts.reduce((acc, p) => acc + p.stockQuantity, 0);
  const totalInventoryValue = parts.reduce(
    (acc, p) => acc + p.price * p.stockQuantity,
    0,
  );

  // ── form helpers ────────────────────────────────────────────────────────
  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Part name is required.";
    if (!formData.category.trim()) newErrors.category = "Category is required.";
    if (!formData.price) newErrors.price = "Price is required.";
    else if (Number(formData.price) <= 0)
      newErrors.price = "Price must be greater than 0.";
    if (formData.stockQuantity === "")
      newErrors.stockQuantity = "Stock quantity is required.";
    else if (Number(formData.stockQuantity) < 0)
      newErrors.stockQuantity = "Stock quantity cannot be negative.";
    if (!formData.vendorId) newErrors.vendorId = "Vendor is required.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const openEditModal = (part) => {
    setEditingPart(part);
    setFormData({
      name: part.name,
      description: part.description,
      category: part.category,
      price: part.price,
      stockQuantity: part.stockQuantity,
      vendorId: part.vendorId,
    });
    setErrors({});
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingPart(null);
    setFormData(initialForm);
    setErrors({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    try {
      const payload = {
        ...formData,
        price: Number(formData.price),
        stockQuantity: Number(formData.stockQuantity),
        vendorId: Number(formData.vendorId),
      };
      editingPart
        ? await updatePart(editingPart.partId, payload)
        : await createPart(payload);
      closeModal();
      loadData();
    } catch (error) {
      console.error(error);
      alert(error?.response?.data?.message || "Failed to save part.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this part?")) return;
    try {
      await deletePartApi(id);
      loadData();
    } catch (error) {
      console.error(error);
      alert(error?.response?.data?.message || "Failed to delete part.");
    }
  };

  // ── render ──────────────────────────────────────────────────────────────
  return (
    <div className="pm-page">
      {/* ── Stat cards ── */}
      <div className="pm-stats-grid">
        <div className="pm-stat-card">
          <div className="pm-stat-text">
            <p className="pm-stat-label">TOTAL PARTS</p>
            <h2 className="pm-stat-value">{totalParts}</h2>
          </div>
          <div className="pm-stat-icon blue">
            <FaBoxOpen />
          </div>
        </div>

        <div className="pm-stat-card">
          <div className="pm-stat-text">
            <p className="pm-stat-label">TOTAL STOCK</p>
            <h2 className="pm-stat-value">{totalStock}</h2>
          </div>
          <div className="pm-stat-icon green">
            <FaWarehouse />
          </div>
        </div>

        <div className="pm-stat-card">
          <div className="pm-stat-text">
            <p className="pm-stat-label">LOW STOCK PARTS</p>
            <h2 className="pm-stat-value">{lowStockCount}</h2>
          </div>
          <div className="pm-stat-icon yellow">
            <FaExclamationTriangle />
          </div>
        </div>

        <div className="pm-stat-card">
          <div className="pm-stat-text">
            <p className="pm-stat-label">INVENTORY VALUE</p>
            <h2 className="pm-stat-value">
              ${totalInventoryValue.toLocaleString()}
            </h2>
          </div>
          <div className="pm-stat-icon purple">
            <FaBoxOpen />
          </div>
        </div>
      </div>

      {/* ── Table card ── */}
      <div className="pm-table-card">
        <div className="pm-table-wrapper">
          <table className="pm-table">
            <thead>
              <tr>
                <th>PART</th>
                <th>CATEGORY</th>
                <th>VENDOR</th>
                <th>PRICE</th>
                <th>STOCK</th>
                <th>STATUS</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan="7" className="pm-empty">
                    Loading…
                  </td>
                </tr>
              )}
              {!loading && filteredParts.length === 0 && (
                <tr>
                  <td colSpan="7" className="pm-empty">
                    No parts found.
                  </td>
                </tr>
              )}
              {!loading &&
                filteredParts.map((part) => (
                  <tr key={part.partId}>
                    <td>
                      <div className="pm-part-info">
                        <div className="pm-avatar">{part.name.charAt(0)}</div>
                        <div>
                          <p className="pm-part-name">{part.name}</p>
                          <p className="pm-part-sub">ID: {part.partId}</p>
                        </div>
                      </div>
                    </td>
                    <td>{part.category}</td>
                    <td>{part.vendorName}</td>
                    <td>${part.price.toLocaleString()}</td>
                    <td>{part.stockQuantity}</td>
                    <td>
                      {part.stockQuantity < 10 ? (
                        <span className="pm-badge low">Low Stock</span>
                      ) : (
                        <span className="pm-badge in-stock">In Stock</span>
                      )}
                    </td>
                    <td>
                      <div className="pm-actions">
                        <button
                          className="pm-icon-btn edit"
                          onClick={() => openEditModal(part)}
                          title="Edit"
                        >
                          <FaEdit />
                        </button>
                        <button
                          className="pm-icon-btn delete"
                          onClick={() => handleDelete(part.partId)}
                          title="Delete"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Modal — uses App.css global classes to match Staff modal styling ── */}
      {showModal && (
        <div className="modal-backdrop">
          <div className="modal">
            <div className="modal-header">
              <div>
                <h2>{editingPart ? "Edit Part" : "Add Part"}</h2>
                <span>
                  {editingPart
                    ? "Update the details below"
                    : "Fill in the details below"}
                </span>
              </div>
              <button className="ghost-icon" onClick={closeModal} title="Close">
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                {/* Row 1 */}
                <label>
                  Part Name
                  <input
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g. Brake Pad"
                  />
                  {errors.name && (
                    <span className="pm-error">{errors.name}</span>
                  )}
                </label>

                <label>
                  Category
                  <input
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    placeholder="e.g. Brakes"
                  />
                  {errors.category && (
                    <span className="pm-error">{errors.category}</span>
                  )}
                </label>

                {/* Row 2 */}
                <label>
                  Price
                  <input
                    type="number"
                    step="0.01"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    placeholder="0.00"
                  />
                  {errors.price && (
                    <span className="pm-error">{errors.price}</span>
                  )}
                </label>

                <label>
                  Stock Quantity
                  <input
                    type="number"
                    name="stockQuantity"
                    value={formData.stockQuantity}
                    onChange={handleChange}
                    placeholder="0"
                  />
                  {errors.stockQuantity && (
                    <span className="pm-error">{errors.stockQuantity}</span>
                  )}
                </label>

                {/* Row 3 — full width */}
                <label style={{ gridColumn: "1 / -1" }}>
                  Vendor
                  <select
                    name="vendorId"
                    value={formData.vendorId}
                    onChange={handleChange}
                  >
                    <option value="">Select Vendor</option>
                    {vendors.map((v) => (
                      <option key={v.vendorId} value={v.vendorId}>
                        {v.name}
                      </option>
                    ))}
                  </select>
                  {errors.vendorId && (
                    <span className="pm-error">{errors.vendorId}</span>
                  )}
                </label>

                {/* Row 4 — full width textarea */}
                <label style={{ gridColumn: "1 / -1" }}>
                  Description
                  <textarea
                    name="description"
                    rows="4"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Enter part description"
                    style={{
                      padding: "10px 12px",
                      border: "1px solid var(--color-border)",
                      borderRadius: "8px",
                      font: "inherit",
                      resize: "none",
                      width: "100%",
                      boxSizing: "border-box",
                    }}
                  />
                </label>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={closeModal}
                >
                  Cancel
                </button>
                <button type="submit" className="primary-button">
                  {editingPart ? "Update Part" : "Save Part"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
