import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaUserPlus, FaEdit, FaTrash, FaSearch } from "react-icons/fa";
import { Table, Modal, Button, Input, Select, message, Spin, Tag } from "antd";
import moment from "moment";
//import { useNavigate } from "react-router-dom";
import "./Users.css";

const { Search } = Input;
const { Option } = Select;

const Users = () => {
  const [staffs, setStaffs] = useState([]);
  const [filteredStaffs, setFilteredStaffs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
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
  //const navigate = useNavigate(); // you can keep or remove if you still need navigation

  const roleColors = {
    admin: "tomato",
    chef: "orange",
    waiter: "blue",
    cashier: "green",
    delivery: "cyan",
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
      filters: Object.keys(roleColors).map((r) => ({
        text: r.charAt(0).toUpperCase() + r.slice(1),
        value: r,
      })),
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
      const { data } = await axios.get(
        "http://localhost:4000/api/staff/getStaff"
      );
      setStaffs(data.staffs);
      setFilteredStaffs(data.staffs);
    } catch (err) {
      console.error(err);
      message.error("Failed to load staff list");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaffs();
  }, []);

  useEffect(() => {
    const filtered = staffs.filter(
      (s) =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.role.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredStaffs(filtered);
  }, [searchTerm, staffs]);

  const handleToggleForm = () => {
    setShowForm((v) => !v);
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

  const handleInputChange = ({ target: { name, value } }) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
    try {
      const url = editMode
        ? `http://localhost:4000/api/staff/update/${currentStaffId}`
        : "http://localhost:4000/api/staff/register";
      const response = editMode
        ? await axios.put(url, formData)
        : await axios.post(url, formData);

      if (response.data.success) {
        await fetchStaffs();
        setShowForm(false);
        message.success(editMode ? "Staff updated!" : "Staff added!");
      } else {
        setError(response.data.message || "Operation failed");
        message.error(response.data.message || "Operation failed");
      }
    } catch (err) {
      console.error(err);
      message.error("An error occurred");
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
      const { data } = await axios.delete(
        `http://localhost:4000/api/staff/delete/${id}`
      );
      if (data.success) {
        await fetchStaffs();
        message.success("Staff deleted");
      }
    } catch (err) {
      console.error(err);
      message.error("Delete failed");
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
              <Option value="delivery">Delivery</Option>
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
