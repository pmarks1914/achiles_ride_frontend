import React, { useEffect, useState } from 'react';
import axios from 'axios';
import moment from 'moment';
import { XMarkIcon } from '@heroicons/react/24/outline';
import DataTable from 'react-data-table-component';
import Swal from 'sweetalert2';
import Select from 'react-select';
import { toast } from 'react-toastify';
import { Button } from '@material-tailwind/react';

let currentUser = JSON.parse(localStorage.getItem("userDataStore"));

const apiUrl = import.meta.env.VITE_API_URL_BASE_API;


const CustomerManagement = () => {
    const [tableData, setTableData] = useState([]);
    const [totalRecords, setTotalRecords] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [loading, setLoading] = useState(true);
    const [searchText, setSearchText] = useState('');
    const [dateRange, setDateRange] = useState({});
    
    // Modals
    const [createModal, setCreateModal] = useState(false);
    const [viewModal, setViewModal] = useState(false);
    const [editModal, setEditModal] = useState(false);
    
    const [pagination, setPagination] = useState({
        next: '',
        previous: ''
    });

    // Form data
    const [newRiderData, setNewRiderData] = useState({
        name: '',
        email: '',
        phone: '',
        license_number: '',
        vehicle_registration: ''
    });
    
    const [selectedRider, setSelectedRider] = useState(null);
    const [editRiderData, setEditRiderData] = useState({});

    useEffect(() => {
        fetchRiders();
    }, [currentPage, pageSize, searchText]);

    const fetchRiders = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${apiUrl}/api/user/?user_type=customer`, {
                params: {
                    page: currentPage,
                    per_page: pageSize,
                    start_date: dateRange[0] ? moment(dateRange[0]).format('YYYY-MM-DD') : null,
                    end_date: dateRange[1] ? moment(dateRange[1]).format('YYYY-MM-DD') : null,
                    search: searchText
                },
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${currentUser.access_token}`
                },
            });            

            if (response?.status === 200) {
                // console.log("response >>", response?.data)

                const { current_page, has_next, has_previous, total_items, page_size, total_pages, items } = response?.data;
                setTableData(items);
                setTotalRecords(total_items);
                setPagination({ next: has_next, previous: has_previous });
            }
        } catch (error) {
            toast.error("Error fetching riders data");
            console.error("Error fetching riders:", error);
        }
        setLoading(false);
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const handlePerRowsChange = (newPerPage, page) => {
        setPageSize(newPerPage);
        setCurrentPage(page);
    };

    const handleSearch = (e) => {
        setSearchText(e.target.value);
    };

    const handleCreateRider = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(`${apiUrl}/riders`, 
                {
                    name: newRiderData.name,
                    email: newRiderData.email,
                    phone: newRiderData.phone,
                    license_number: newRiderData.license_number,
                    vehicle_registration: newRiderData.vehicle_registration
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${currentUser.access_token}`
                    }
                }
            );

            if (response.status === 201) {
                toast.success("Customer created successfully");
                setCreateModal(false);
                fetchRiders();
                resetNewRiderForm();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to create rider");
            console.error("Error creating rider:", error);
        }
    };

    const handleUpdateRider = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.put(
                `${apiUrl}/riders/${selectedRider?.user_id}`,
                {
                    name: editRiderData.name,
                    email: editRiderData.email,
                    phone: editRiderData.phone,
                    license_number: editRiderData.license_number,
                    vehicle_registration: editRiderData.vehicle_registration,
                    availability_status: editRiderData.availability_status
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${currentUser.access_token}`
                    }
                }
            );

            if (response.status === 200) {
                toast.success("Customer updated successfully");
                setEditModal(false);
                fetchRiders();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to update rider");
            console.error("Error updating rider:", error);
        }
    };

    const handleDeleteRider = (rider) => {
        Swal.fire({
            title: 'Are you sure?',
            text: `You are about to delete ${rider?.name}`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const response = await axios.delete(
                        `${apiUrl}/riders/${rider?.user_id}`,
                        {
                            headers: {
                                'Authorization': `Bearer ${currentUser.access_token}`
                            }
                        }
                    );

                    if (response.status === 200) {
                        toast.success("Customer deleted successfully");
                        fetchRiders();
                    }
                } catch (error) {
                    toast.error(error.response?.data?.message || "Failed to delete rider");
                    console.error("Error deleting rider:", error);
                }
            }
        });
    };

    const resetNewRiderForm = () => {
        setNewRiderData({
            name: '',
            email: '',
            phone: '',
            license_number: '',
            vehicle_registration: ''
        });
    };

    const columns = [
        { 
            name: 'No.', 
            selector: (row, index) => index + 1, 
            width: '5%' 
        },
        { 
            name: 'Name', 
            selector: row => row?.name, 
            width: '20%' 
        },
        { 
            name: 'Email', 
            selector: row => row?.email, 
            width: '20%' 
        },
        { 
            name: 'Phone', 
            selector: row => row?.phone, 
            width: '15%' 
        },
        { 
            name: 'Status', 
            cell: row => (
                <span className={`px-2 py-1 rounded-full text-xs ${
                    row?.disabled === "false" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                }`}>
                    {row?.disabled === "false" ? "Active" : "Inactive"}
                </span>
            ),
            // width: '10%'
        },
        { 
            name: 'Actions', 
            cell: row => (
                <div className="">
                    <button 
                        className="m-1 px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 text-sm"
                        onClick={() => {
                            setSelectedRider(row);
                            setViewModal(true);
                        }}
                    >
                        View
                    </button>
                    <button 
                        className="m-1 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                        onClick={() => {
                            setSelectedRider(row);
                            setEditRiderData({
                                name: row?.name,
                                email: row?.email,
                                phone: row?.phone,
                                license_number: row?.rider?.license_number,
                                vehicle_registration: row?.rider?.vehicle_registration,
                                availability_status: row?.rider?.availability_status
                            });
                            setEditModal(true);
                        }}
                    >
                        Edit
                    </button>
                    <button 
                        className="m-1 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                        onClick={() => handleDeleteRider(row)}
                    >
                        Delete
                    </button>
                </div>
            ),
            // width: '15%'
        }
    ];

    return (
        <div className="p-2">
            {/* <h4 className="text-2xl font-bold mb-6 text-gray-800">Customer Management</h4> */}

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <Button 
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                    onClick={() => setCreateModal(true)}
                >
                    Add New Customer
                </Button>
                <div className="w-full md:w-64">
                    <input
                        type="text"
                        className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Search riders..."
                        value={searchText}
                        onChange={handleSearch}
                    />
                </div>
            </div>

            <DataTable
                columns={columns}
                data={tableData}
                pagination
                paginationServer
                paginationPerPage={pageSize}
                paginationTotalRows={totalRecords}
                onChangePage={handlePageChange}
                onChangeRowsPerPage={handlePerRowsChange}
                paginationRowsPerPageOptions={[2, 10, 20, 50, 100, 1000]}
                progressPending={loading}
                persistTableHead
                progressComponent={
                    <div className="flex items-center justify-center p-4">
                        <span className="text-lg">
                            <span className="text-gray-600">Fetching data, please wait</span>
                            <span className="animate-pulse">.</span>
                            <span className="animate-pulse delay-1000">.</span>
                            <span className="animate-pulse delay-2000">.</span>
                        </span>
                    </div>
                }
                className="border rounded-lg overflow-hidden"
            />

            {/* Create Customer Modal */}
            <aside
                className={`fixed top-0 right-0 z-50 h-screen w-96 bg-white px-6 shadow-lg transition-transform duration-300 ${
                    createModal ? "translate-x-0" : "translate-x-full"
                }`}
            >
                <div className="flex items-start justify-between pt-8 pb-6">
                    <div>
                        <h5 className="text-xl font-semibold text-gray-800">Add New Customer</h5>
                    </div>
                    <button
                        className="text-gray-500 hover:text-gray-700"
                        onClick={() => setCreateModal(false)}
                    >
                        <XMarkIcon className="h-5 w-5" />
                    </button>
                </div>
                
                <form onSubmit={handleCreateRider} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                        <input
                            type="text"
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={newRiderData.name}
                            onChange={(e) => setNewRiderData({...newRiderData, name: e.target.value})}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                            type="email"
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={newRiderData.email}
                            onChange={(e) => setNewRiderData({...newRiderData, email: e.target.value})}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                        <input
                            type="text"
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={newRiderData.phone}
                            onChange={(e) => setNewRiderData({...newRiderData, phone: e.target.value})}
                            required
                        />
                    </div>
                    <div className="flex justify-end space-x-3 pt-4">
                        
                        <button 
                            type="button"
                            className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
                            onClick={() => setCreateModal(false)}
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit"
                            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                        >
                            Create Customer
                        </button>
                    </div>
                </form>
            </aside>

            {/* View Customer Modal */}
            <aside
                className={`fixed top-0 right-0 z-50 h-screen w-96 bg-white px-6 shadow-lg transition-transform duration-300 ${
                    viewModal ? "translate-x-0" : "translate-x-full"
                }`}
            >
                <div className="flex items-start justify-between pt-8 pb-6">
                    <div>
                        <h5 className="text-xl font-semibold text-gray-800">Customer Details</h5>
                    </div>
                    <button
                        className="text-gray-500 hover:text-gray-700"
                        onClick={() => setViewModal(false)}
                    >
                        <XMarkIcon className="h-5 w-5" />
                    </button>
                </div>
                
                {selectedRider && (
                    <div className="space-y-4">
                        <div>
                            <p className="text-sm text-gray-500">Name</p>
                            <p className="text-gray-800">{selectedRider?.name}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Email</p>
                            <p className="text-gray-800">{selectedRider?.email}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Phone</p>
                            <p className="text-gray-800">{selectedRider?.phone}</p>
                        </div>                        
                        <div>
                            <p className="text-sm text-gray-500">Status</p>
                            <span className={`px-2 py-1 rounded-full text-xs ${
                                selectedRider?.disabled === "false" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                            }`}>
                                {selectedRider?.disabled === "false" ? "Active" : "Inactive"}
                            </span>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Registered At</p>
                            <p className="text-gray-800">{moment(selectedRider?.registered_at).format('LLL')}</p>
                        </div>
                    </div>
                )}
                
                <div className="flex justify-end pt-6">
                    <button 
                        className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                        onClick={() => setViewModal(false)}
                    >
                        Close
                    </button>
                </div>
            </aside>

            {/* Edit Customer Modal */}
            <aside
                className={`fixed top-0 right-0 z-50 h-screen w-96 bg-white px-6 shadow-lg transition-transform duration-300 ${
                    editModal ? "translate-x-0" : "translate-x-full"
                }`}
            >
                <div className="flex items-start justify-between pt-8 pb-6">
                    <div>
                        <h5 className="text-xl font-semibold text-gray-800">Edit Customer</h5>
                    </div>
                    <button
                        className="text-gray-500 hover:text-gray-700"
                        onClick={() => setEditModal(false)}
                    >
                        <XMarkIcon className="h-5 w-5" />
                    </button>
                </div>
                
                <form onSubmit={handleUpdateRider} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                        <input
                            type="text"
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={editRiderData.name}
                            onChange={(e) => setEditRiderData({...editRiderData, name: e.target.value})}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                            type="email"
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-100"
                            value={editRiderData.email}
                            onChange={(e) => setEditRiderData({...editRiderData, email: e.target.value})}
                            required
                            disabled
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                        <input
                            type="text"
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={editRiderData.phone}
                            onChange={(e) => setEditRiderData({...editRiderData, phone: e.target.value})}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Availability Status</label>
                        <Select
                            options={[
                                { value: 'available', label: 'Available' },
                                { value: 'unavailable', label: 'Unavailable' },
                                { value: 'on_delivery', label: 'On Delivery' }
                            ]}
                            value={{
                                value: editRiderData.availability_status,
                                label: editRiderData.availability_status?.replace('_', ' ')?.toUpperCase()
                            }}
                            onChange={(selected) => setEditRiderData({
                                ...editRiderData, 
                                availability_status: selected.value
                            })}
                            className="basic-single"
                            classNamePrefix="select"
                        />
                    </div>
                    <div className="flex justify-end space-x-3 pt-4">
                        <button 
                            type="button"
                            className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
                            onClick={() => setEditModal(false)}
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit"
                            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                        >
                            Update Customer
                        </button>
                    </div>
                </form>
            </aside>
        </div>
    );
};

export default CustomerManagement;