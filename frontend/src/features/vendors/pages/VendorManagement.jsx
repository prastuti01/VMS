import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  FaEdit,
  FaMapMarkerAlt,
  FaTimes,
  FaTrash,
  FaTruck,
  FaUsers,
} from "react-icons/fa";

import {
  createVendor,
  deleteVendorApi,
  getVendors,
  updateVendor,
} from "../../../shared/config/api";

import "./VendorManagement.css";

const initialForm = { name: "", email: "", phone: "", address: "" };

/**
 * Props
 *  query          – search string from the topbar
 *  onRegisterOpen – receives openCreateModal so the topbar "Add Vendor"
 *                   button can trigger it from outside
 */
export default function VendorManagement({ query = "", onRegisterOpen }) {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingVendor, setEditingVendor] = useState(null);
  const [formData, setFormData] = useState(initialForm);

  // ── expose openCreateModal to parent ────────────────────────────────────
  const openCreateModal = () => {
    setEditingVendor(null);
    setFormData(initialForm);
    setShowModal(true);
  };

  const registered = useRef(false);
  useEffect(() => {
    if (!registered.current && onRegisterOpen) {
      onRegisterOpen(openCreateModal);
      registered.current = true;
    }
    
  }, [onRegisterOpen]);

  // ── data loading ────────────────────────────────────────────────────────
  const fetchVendors = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getVendors();
      setVendors(response.data);
    } catch (error) {
      console.error("Failed to fetch vendors", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    async function init() {
      await fetchVendors();
    }
    init();
  }, [fetchVendors]);

  // ── filtering driven by topbar query prop ───────────────────────────────
  const filteredVendors = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return vendors;
    return vendors.filter((v) =>
      [v.name, v.email, v.phone, v.address]
        .join(" ")
        .toLowerCase()
        .includes(needle),
    );
  }, [vendors, query]);

  // ── derived stats ────────────────────────────────────────────────────────
  const totalVendors = vendors.length;
  const activeVendors = vendors.length; // all treated as active

  // ── form helpers ─────────────────────────────────────────────────────────
  const openEditModal = (vendor) => {
    setEditingVendor(vendor);
    setFormData({
      name: vendor.name || "",
      email: vendor.email || "",
      phone: vendor.phone || "",
      address: vendor.address || "",
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingVendor(null);
    setFormData(initialForm);
  };

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!/^\d{10}$/.test(formData.phone)) {
      alert("Phone number must be exactly 10 digits.");
      return;
    }
    try {
      editingVendor
        ? await updateVendor(editingVendor.vendorId, formData)
        : await createVendor(formData);
      closeModal();
      fetchVendors();
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.response?.data?.errors?.Phone?.[0] ||
        "Failed to save vendor.";
      alert(message);
    }
  };

  const handleDelete = async (vendorId) => {
    if (!window.confirm("Are you sure you want to delete this vendor?")) return;
    try {
      await deleteVendorApi(vendorId);
      fetchVendors();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to delete vendor.");
    }
  };

  // ── render ───────────────────────────────────────────────────────────────
  return (
    <div className="vm-page">
      {/* ── Stat cards ── */}
      <div className="vm-stats-grid">
        <div className="vm-stat-card">
          <div className="vm-stat-text">
            <p className="vm-stat-label">TOTAL VENDORS</p>
            <h2 className="vm-stat-value">{totalVendors}</h2>
          </div>
          <div className="vm-stat-icon blue">
            <FaUsers />
          </div>
        </div>

        <div className="vm-stat-card">
          <div className="vm-stat-text">
            <p className="vm-stat-label">ACTIVE VENDORS</p>
            <h2 className="vm-stat-value">{activeVendors}</h2>
          </div>
          <div className="vm-stat-icon green">
            <FaTruck />
          </div>
        </div>
      </div>

      {/* ── Table card ── */}
      <div className="vm-table-card">
        <div className="vm-table-wrapper">
          <table className="vm-table">
            <thead>
              <tr>
                <th>VENDOR</th>
                <th>EMAIL</th>
                <th>PHONE</th>
                <th>ADDRESS</th>
                <th>STATUS</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan="6" className="vm-empty">
                    Loading…
                  </td>
                </tr>
              )}
              {!loading && filteredVendors.length === 0 && (
                <tr>
                  <td colSpan="6" className="vm-empty">
                    No vendors found.
                  </td>
                </tr>
              )}
              {!loading &&
                filteredVendors.map((vendor) => (
                  <tr key={vendor.vendorId}>
                    <td>
                      <div className="vm-vendor-info">
                        <div className="vm-avatar">
                          {vendor.name?.charAt(0)}
                        </div>
                        <div>
                          <p className="vm-vendor-name">{vendor.name}</p>
                          <p className="vm-vendor-sub">ID: {vendor.vendorId}</p>
                        </div>
                      </div>
                    </td>
                    <td>{vendor.email}</td>
                    <td>{vendor.phone}</td>
                    <td>
                      <div className="vm-address-cell">
                        <FaMapMarkerAlt />
                        {vendor.address}
                      </div>
                    </td>
                    <td>
                      <span className="vm-badge active">Active</span>
                    </td>
                    <td>
                      <div className="vm-actions">
                        <button
                          className="vm-icon-btn edit"
                          onClick={() => openEditModal(vendor)}
                          title="Edit"
                        >
                          <FaEdit />
                        </button>
                        <button
                          className="vm-icon-btn delete"
                          onClick={() => handleDelete(vendor.vendorId)}
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

      {/* ── Modal — uses App.css global classes ── */}
      {showModal && (
        <div className="modal-backdrop">
          <div className="modal">
            <div className="modal-header">
              <div>
                <h2>{editingVendor ? "Edit Vendor" : "Add Vendor"}</h2>
                <span>
                  {editingVendor
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
                <label>
                  Vendor Name
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g. AutoPart Co."
                    required
                  />
                </label>

                <label>
                  Email
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="vendor@example.com"
                    required
                  />
                </label>

                <label>
                  Phone
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="10-digit number"
                    maxLength={10}
                    inputMode="numeric"
                    pattern="\d{10}"
                    required
                  />
                </label>

                <label>
                  Address
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Street, City"
                    required
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
                  {editingVendor ? "Update Vendor" : "Save Vendor"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
