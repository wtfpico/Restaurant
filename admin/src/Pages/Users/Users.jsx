import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { FaUserPlus, FaEdit, FaTrash, FaSearch } from "react-icons/fa";
import { AdminContext } from "../../Context/AdminContext";
import { Table, Modal, Button, Input, Select, message, Spin, Tag } from "antd";
import moment from "moment";
import "./Users.css"; // Assuming you have a CSS file for styling
import { useNavigate } from "react-router-dom";

const { Search } = Input;
const { Option } = Select;

const Users = () => {
  const { adminToken } = useContext(AdminContext);
  const [staffs, setStaffs] = useState([]);
  const [filteredStaffs, setFilteredStaffs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "waiter",
  });
  const [editMode, setEditMode] = useState(false);
  const [currentStaffId, setCurrentStaffId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const roleColors = {
    admin: "red",
    chef: "orange",
    waiter: "blue",
    cashier: "green",
  };

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      sorter: (a, b) => a.email.localeCompare(b.email),
    },
    {
      title: "Role",
      dataIndex: "role",
      key: "role",
      render: (role) => (
        <Tag color={roleColors[role]}>
          {role.charAt(0).toUpperCase() + role.slice(1)}
        </Tag>
      ),
      sorter: (a, b) => a.role.localeCompare(b.role),
      filters: [
        { text: "Admin", value: "admin" },
        { text: "Chef", value: "chef" },
        { text: "Waiter", value: "waiter" },
        { text: "Cashier", value: "cashier" },
      ],
      onFilter: (value, record) => record.role === value,
    },
    {
      title: "Created At",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) => moment(date).format("LLL"),
      sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <div className="action-buttons">
          <Button
            type="text"
            icon={<FaEdit />}
            onClick={() => handleEdit(record)}
          />
          <Button
            type="text"
            danger
            icon={<FaTrash />}
            onClick={() => confirmDelete(record._id)}
          />
        </div>
      ),
    },
  ];

  const fetchStaffs = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        "http://localhost:4000/api/staff/getStaff",
        {
          headers: { Authorization: `Bearer ${adminToken}` },
        }
      );
      setStaffs(response.data.staffs);
      setFilteredStaffs(response.data.staffs);
    } catch (error) {
      handleTokenError(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaffs();
  }, []);

  useEffect(() => {
    const filtered = staffs.filter(
      (staff) =>
        staff.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        staff.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        staff.role.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredStaffs(filtered);
  }, [searchTerm, staffs]);

  const handleTokenError = (error) => {
    const message =
      error.response?.data?.message || "Authentication error. Please log in.";
    console.error("Token error:", message);

    if (
      message.toLowerCase().includes("jwt expired") ||
      message.toLowerCase().includes("invalid token") ||
      error.response?.status === 401
    ) {
      localStorage.removeItem("adminToken");
      Modal.error({
        title: "Session Expired",
        content: "Your session has expired. Please log in again.",
        onOk: () => navigate("/staff/login"),
      });
    } else {
      setError(message);
      message.error(message);
    }
  };

  const handleToggleForm = () => {
    setShowForm(!showForm);
    setEditMode(false);
    setFormData({ name: "", email: "", password: "", role: "waiter" });
    setError("");
  };

  const handleEdit = (staff) => {
    setFormData({
      name: staff.name,
      email: staff.email,
      password: "",
      role: staff.role,
    });
    setCurrentStaffId(staff._id);
    setEditMode(true);
    setShowForm(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      let response;
      if (editMode) {
        response = await axios.put(
          `http://localhost:4000/api/staff/updateStaff/${currentStaffId}`,
          formData,
          { headers: { Authorization: `Bearer ${adminToken}` } }
        );
      } else {
        response = await axios.post(
          "http://localhost:4000/api/staff/register",
          formData,
          { headers: { Authorization: `Bearer ${adminToken}` } }
        );
      }

      if (response.data.success) {
        await fetchStaffs();
        setShowForm(false);
        setFormData({ name: "", email: "", password: "", role: "waiter" });
        message.success(
          editMode
            ? "Staff updated successfully!"
            : "Staff registered successfully!"
        );
      } else {
        setError(response.data.message || "Operation failed");
      }
    } catch (error) {
      handleTokenError(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = (id) => {
    Modal.confirm({
      title: "Confirm Delete",
      content: "Are you sure you want to delete this staff member?",
      okText: "Delete",
      okType: "danger",
      cancelText: "Cancel",
      onOk: () => handleDelete(id),
    });
  };

  const handleDelete = async (id) => {
    try {
      const response = await axios.delete(
        `http://localhost:4000/api/staff/deleteStaff/${id}`,
        { headers: { Authorization: `Bearer ${adminToken}` } }
      );
      if (response.data.success) {
        await fetchStaffs();
        message.success("Staff deleted successfully!");
      }
    } catch (error) {
      handleTokenError(error);
    }
  };

  return (
    <div className="users-container">
      <div className="users-header">
        <h2>Staff Management</h2>
        <div className="controls">
          <Search
            placeholder="Search staff..."
            allowClear
            enterButton={<FaSearch />}
            size="large"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <Button
            type="primary"
            icon={<FaUserPlus />}
            onClick={handleToggleForm}
          >
            Add Staff
          </Button>
        </div>
      </div>

      <Modal
        title={editMode ? "Edit Staff" : "Add Staff"}
        visible={showForm}
        onCancel={handleToggleForm}
        footer={null}
        destroyOnClose
      >
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Name</label>
            <Input
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Email</label>
            <Input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <Input.Password
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              required={!editMode}
            />
          </div>
          <div className="form-group">
            <label>Role</label>
            <Select
              name="role"
              value={formData.role}
              onChange={(value) =>
                setFormData((prev) => ({ ...prev, role: value }))
              }
              style={{ width: "100%" }}
            >
              <Option value="admin">Admin</Option>
              <Option value="chef">Chef</Option>
              <Option value="waiter">Waiter</Option>
              <Option value="cashier">Cashier</Option>
            </Select>
          </div>
          {error && <div className="error-message">{error}</div>}
          <div className="form-actions">
            <Button onClick={handleToggleForm}>Cancel</Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={isSubmitting}
              disabled={isSubmitting}
            >
              {editMode ? "Update" : "Register"}
            </Button>
          </div>
        </form>
      </Modal>

      <div className="staff-table">
        <Spin spinning={loading}>
          <Table
            columns={columns}
            dataSource={filteredStaffs}
            rowKey="_id"
            pagination={{ pageSize: 10 }}
            scroll={{ x: true }}
            locale={{
              emptyText: (
                <div className="empty-table">
                  <p>No staff members found</p>
                  <Button type="primary" onClick={handleToggleForm}>
                    Add New Staff
                  </Button>
                </div>
              ),
            }}
          />
        </Spin>
      </div>
    </div>
  );
};

export default Users;
