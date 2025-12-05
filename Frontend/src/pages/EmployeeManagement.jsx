import React, { useState, useEffect } from "react";
import { Container, Table, Button, Modal, Form } from "react-bootstrap";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const EmployeeManagement = () => {
const [employees, setEmployees] = useState(() => {
    const saved = localStorage.getItem("employees");
    return saved ? JSON.parse(saved) : [];
});

const [showModal, setShowModal] = useState(false);
const [showConfirmModal, setShowConfirmModal] = useState(false);
const [isEdit, setIsEdit] = useState(false);
const [search, setSearch] = useState("");
const [deleteId, setDeleteId] = useState(null);

const [currentEmployee, setCurrentEmployee] = useState({
    id: "",
    name: "",
    position: "",
    salary: "",
    jobdesk: "",
});

useEffect(() => {
    localStorage.setItem("employees", JSON.stringify(employees));
}, [employees]);

const handleShowModal = () => setShowModal(true);
const handleCloseModal = () => {
    setShowModal(false);
    setCurrentEmployee({ id: "", name: "", position: "", salary: "", jobdesk: "" });
    setIsEdit(false);
};

const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentEmployee({ ...currentEmployee, [name]: value });
};

const handleCreateOrUpdate = () => {
    if (
    !currentEmployee.name.trim() ||
    !currentEmployee.position.trim() ||
    !currentEmployee.salary ||
    !currentEmployee.jobdesk.trim()
        ) {
        toast.error("Semua field harus diisi!");
        return;
        }
        if (parseInt(currentEmployee.salary) <= 0) {
        toast.error("Gaji harus lebih besar dari 0!");
        return;
        }

        if (isEdit) {
        setEmployees((prev) =>
            prev.map((emp) => (emp.id === currentEmployee.id ? currentEmployee : emp))
        );
        toast.success("Berhasil Edit Data!");
        } else {
        const newEmployee = {
            ...currentEmployee,
            id: Date.now().toString(),
        };
        setEmployees((prev) => [...prev, newEmployee]);
        toast.success("Berhasil Tambah Data!");
        }
        handleCloseModal();
    };

    const handleEdit = (employee) => {
        setIsEdit(true);
        setCurrentEmployee(employee);
        handleShowModal();
    };

    const handleDelete = (id) => {
        setDeleteId(id);
        setShowConfirmModal(true);
    };

    const confirmDelete = () => {
        const updated = employees.filter((emp) => emp.id !== deleteId);
        setEmployees(updated);
        localStorage.setItem("employees", JSON.stringify(updated));
        toast.error("Data berhasil dihapus!");
        setShowConfirmModal(false);
    };

    return (
        <Container className="mt-5">
        <h1 className="mb-4 border-bottom fw-bold">Daftar Karyawan</h1>
        <Button variant="success" onClick={handleShowModal}>
            Tambah Karyawan
        </Button>

        <Form.Control
            type="text"
            placeholder="🔍 Cari karyawan berdasarkan nama..."
            className="mt-3 mb-3"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
        />

        <p>Saat ini terdapat {employees.length} karyawan</p>

        <Table striped bordered hover>
            <thead>
            <tr>
                <th>No</th>
                <th>Jabatan</th>
                <th>Nama</th>
                <th>Gaji</th>
                <th>Jobdesk</th>
                <th>Aksi</th>
            </tr>
            </thead>
            <tbody>
            {employees.length > 0 ? (
                employees
                .filter((employee) =>
                    employee.name.toLowerCase().includes(search.toLowerCase())
                )
                .map((employee, index) => (
                    <tr key={employee.id}>
                    <td>{index + 1}</td>
                    <td>{employee.position}</td>
                    <td>{employee.name}</td>
                    <td>Rp {parseInt(employee.salary).toLocaleString("id-ID")}</td>
                    <td>{employee.jobdesk}</td>
                    <td>
                        <Button
                        variant="warning"
                        className="me-2"
                        onClick={() => handleEdit(employee)}
                        >
                        Edit
                        </Button>
                        <Button
                        variant="danger"
                        onClick={() => handleDelete(employee.id)}
                        >
                        Hapus
                        </Button>
                    </td>
                    </tr>
                ))
            ) : (
                <tr>
                <td colSpan="6" className="text-center">
                    Tidak ada data karyawan.
                </td>
                </tr>
            )}
            </tbody>
        </Table>

        <Modal show={showModal} onHide={handleCloseModal}>
            <Modal.Header closeButton>
            <Modal.Title>{isEdit ? "Edit Karyawan" : "Tambah Karyawan"}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
            <Form>
                <Form.Group className="mb-3">
                <Form.Label>Nama Karyawan</Form.Label>
                <Form.Control
                    type="text"
                    name="name"
                    value={currentEmployee.name}
                    onChange={handleInputChange}
                    placeholder="Nama Karyawan"
                />
                </Form.Group>
                <Form.Group className="mb-3">
                <Form.Label>Jabatan Karyawan</Form.Label>
                <Form.Control
                    type="text"
                    name="position"
                    value={currentEmployee.position}
                    onChange={handleInputChange}
                    placeholder="Jabatan Karyawan"
                />
                </Form.Group>
                <Form.Group className="mb-3">
                <Form.Label>Gaji</Form.Label>
                <Form.Control
                    type="number"
                    name="salary"
                    value={currentEmployee.salary}
                    onChange={handleInputChange}
                    placeholder="Gaji"
                />
                </Form.Group>
                <Form.Group className="mb-3">
                <Form.Label>Jobdesk Karyawan</Form.Label>
                <Form.Control
                    as="textarea"
                    rows={3}
                    name="jobdesk"
                    value={currentEmployee.jobdesk}
                    onChange={handleInputChange}
                    placeholder="Jobdesk Karyawan"
                />
                </Form.Group>
            </Form>
            </Modal.Body>
            <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal}>
                Batal
            </Button>
            <Button variant="primary" onClick={handleCreateOrUpdate}>
                Simpan
            </Button>
            </Modal.Footer>
        </Modal>

        <Modal show={showConfirmModal} onHide={() => setShowConfirmModal(false)} centered>
            <Modal.Header closeButton>
            <Modal.Title>Konfirmasi Hapus</Modal.Title>
            </Modal.Header>
            <Modal.Body>Apakah Anda yakin ingin menghapus data karyawan ini?</Modal.Body>
            <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowConfirmModal(false)}>
                Batal
            </Button>
            <Button variant="danger" onClick={confirmDelete}>
                Ya, Hapus
            </Button>
            </Modal.Footer>
        </Modal>

        <ToastContainer
            position="top-center"
            autoClose={3000}
            hideProgressBar={false}
            closeOnClick
            pauseOnFocusLoss
            draggable
            pauseOnHover
            style={{
            top: "30px",
            position: "fixed",
            }}
        />
        </Container>
    );
    };

export default EmployeeManagement;