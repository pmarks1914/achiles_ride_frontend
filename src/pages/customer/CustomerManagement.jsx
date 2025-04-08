import React, { useEffect, useState } from 'react';
import axios from 'axios';
import moment from 'moment';
import { XMarkIcon } from '@heroicons/react/24/outline';
import DataTable from 'react-data-table-component';
import Swal from 'sweetalert2';
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
    const [newCustomerData, setNewCustomerData] = useState({
        name: '',
        email: '',
        phone: '',
        user_type: 'customer',
        password: ''
    });
    
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [editCustomerData, setEditCustomerData] = useState({});

    useEffect(() => {
        fetchCustomers();
    }, [currentPage, pageSize, searchText]);

    const fetchCustomers = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${apiUrl}/api/user/`, {
                params: {
                    page: currentPage,
                    per_page: pageSize,
                    start_date: dateRange[0] ? moment(dateRange[0]).format('YYYY-MM-DD') : null,
                    end_date: dateRange[1] ? moment(dateRange[1]).format('YYYY-MM-DD') : null,
                    search: searchText,
                    user_type: 'customer'
                },
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${currentUser.access_token}`
                },
            });            

            if (response?.status === 200) {
                const { current_page, has_next, has_previous, total_items, page_size, total_pages, items } = response?.data;
                setTableData(items);
                setTotalRecords(total_items);
                setPagination({ next: has_next, previous: has_previous });
            }
        } catch (error) {
            toast.error("Error fetching customer data");
            console.error("Error fetching customers:", error);
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

    const handleCreateCustomer = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(`${apiUrl}/api/user/customers/`, 
                {
                    name: newCustomerData.name,
                    email: newCustomerData.email,
                    phone: newCustomerData.phone,
                    user_type: 'customer',
                    password: newCustomerData.password || `${newCustomerData.email}${newCustomerData.phone}`,
                    disabled: false
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${currentUser.access_token}`
                    }
                }
            );

            if (response.status === 200 || response.status === 201) {
                Swal.fire({
                    icon: 'success',
                    title: `Successful! `,
                    toast: true,
                    position: 'top',
                    showConfirmButton: false,
                    timer: 3000,
                    timerProgressBar: true,
                    closeOnConfirm: false,
                    didOpen: (toast) => {
                      const progressBar = toast.querySelector('.swal2-timer-progress-bar');
                      if (progressBar) {
                        progressBar.style.backgroundColor = 'green';
                      }
                      
                      toast.addEventListener('mouseenter', Swal.stopTimer)
                      toast.addEventListener('mouseleave', Swal.resumeTimer)
                    }
                });
                setCreateModal(false);
                fetchCustomers();
                resetNewCustomerForm();
            } else {
                Swal.fire({
                    icon: 'error',
                    title: `Error! `,
                    toast: true,
                    position: 'top',
                    showConfirmButton: false,
                    timer: 3000,
                    timerProgressBar: true,
                    closeOnConfirm: false,
                    didOpen: (toast) => {
                      const progressBar = toast.querySelector('.swal2-timer-progress-bar');
                      if (progressBar) {
                        progressBar.style.backgroundColor = 'black';
                      }
                      
                      toast.addEventListener('mouseenter', Swal.stopTimer)
                      toast.addEventListener('mouseleave', Swal.resumeTimer)
                    }
                });
            }
        } catch (error) {
            if(error.response){
                Swal.fire({
                    icon: 'error',
                    title: `Error: ${ error?.response?.data?.detail[0]?.msg || error?.response?.data?.detail }`,
                    toast: true,
                    position: 'top',
                    showConfirmButton: false,
                    timer: 3000,
                    timerProgressBar: true,
                    closeOnConfirm: false,
                    didOpen: (toast) => {
                      const progressBar = toast.querySelector('.swal2-timer-progress-bar');
                      if (progressBar) {
                        progressBar.style.backgroundColor = 'black';
                      }
                      
                      toast.addEventListener('mouseenter', Swal.stopTimer)
                      toast.addEventListener('mouseleave', Swal.resumeTimer)
                    }
                });
            } else if(error.request){
                Swal.fire({
                    icon: 'error',
                    title: `Error: ${ error?.request?.data?.detail[0]?.msg || error?.request?.data?.detail }`,
                    toast: true,
                    position: 'top',
                    showConfirmButton: false,
                    timer: 3000,
                    timerProgressBar: true,
                    closeOnConfirm: false,
                    didOpen: (toast) => {
                      const progressBar = toast.querySelector('.swal2-timer-progress-bar');
                      if (progressBar) {
                        progressBar.style.backgroundColor = 'black';
                      }
                      
                      toast.addEventListener('mouseenter', Swal.stopTimer)
                      toast.addEventListener('mouseleave', Swal.resumeTimer)
                    }
                });
            }
        }
    };

    const handleUpdateCustomer = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.patch(
                `${apiUrl}/api/user/${selectedCustomer?.user_id}`,
                {
                    name: editCustomerData.name,
                    phone: editCustomerData.phone,
                    user_type: 'customer',
                    disabled: editCustomerData.disabled
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${currentUser.access_token}`
                    }
                }
            );

            if (response.status === 200) {
                Swal.fire({
                    icon: 'success',
                    title: `Successful! `,
                    toast: true,
                    position: 'top',
                    showConfirmButton: false,
                    timer: 3000,
                    timerProgressBar: true,
                    closeOnConfirm: false,
                    didOpen: (toast) => {
                      const progressBar = toast.querySelector('.swal2-timer-progress-bar');
                      if (progressBar) {
                        progressBar.style.backgroundColor = 'green';
                      }
                      
                      toast.addEventListener('mouseenter', Swal.stopTimer)
                      toast.addEventListener('mouseleave', Swal.resumeTimer)
                    }
                });
                setEditModal(false);
                fetchCustomers();
            } else {
                Swal.fire({
                    icon: 'error',
                    title: `Error! `,
                    toast: true,
                    position: 'top',
                    showConfirmButton: false,
                    timer: 3000,
                    timerProgressBar: true,
                    closeOnConfirm: false,
                    didOpen: (toast) => {
                      const progressBar = toast.querySelector('.swal2-timer-progress-bar');
                      if (progressBar) {
                        progressBar.style.backgroundColor = 'black';
                      }
                      
                      toast.addEventListener('mouseenter', Swal.stopTimer)
                      toast.addEventListener('mouseleave', Swal.resumeTimer)
                    }
                });
            }
        } catch (error) {
            if(error.response){
                Swal.fire({
                    icon: 'error',
                    title: `Error: ${ error?.response?.data?.detail[0]?.msg || error?.response?.data?.detail }`,
                    toast: true,
                    position: 'top',
                    showConfirmButton: false,
                    timer: 3000,
                    timerProgressBar: true,
                    closeOnConfirm: false,
                    didOpen: (toast) => {
                      const progressBar = toast.querySelector('.swal2-timer-progress-bar');
                      if (progressBar) {
                        progressBar.style.backgroundColor = 'black';
                      }
                      
                      toast.addEventListener('mouseenter', Swal.stopTimer)
                      toast.addEventListener('mouseleave', Swal.resumeTimer)
                    }
                });
            } else if(error.request){
                Swal.fire({
                    icon: 'error',
                    title: `Error: ${ error?.request?.data?.detail[0]?.msg || error?.request?.data?.detail }`,
                    toast: true,
                    position: 'top',
                    showConfirmButton: false,
                    timer: 3000,
                    timerProgressBar: true,
                    closeOnConfirm: false,
                    didOpen: (toast) => {
                      const progressBar = toast.querySelector('.swal2-timer-progress-bar');
                      if (progressBar) {
                        progressBar.style.backgroundColor = 'black';
                      }
                      
                      toast.addEventListener('mouseenter', Swal.stopTimer)
                      toast.addEventListener('mouseleave', Swal.resumeTimer)
                    }
                });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: `Error! try again.`,
                    toast: true,
                    position: 'top',
                    showConfirmButton: false,
                    timer: 3000,
                    timerProgressBar: true,
                    closeOnConfirm: false,
                    didOpen: (toast) => {
                      const progressBar = toast.querySelector('.swal2-timer-progress-bar');
                      if (progressBar) {
                        progressBar.style.backgroundColor = 'black';
                      }
                      
                      toast.addEventListener('mouseenter', Swal.stopTimer)
                      toast.addEventListener('mouseleave', Swal.resumeTimer)
                    }
                });
            }
        }
    };

    const handleDeleteCustomer = (customer) => {
        Swal.fire({
            title: 'Are you sure?',
            text: `You are about to delete ${customer?.name}`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const response = await axios.delete(
                        `${apiUrl}/api/user/${customer?.user_id}`,
                        {
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${currentUser.access_token}`
                            }
                        }
                    );

                    if (response.status === 200) {
                        Swal.fire({
                            icon: 'success',
                            title: `Successful! `,
                            toast: true,
                            position: 'top',
                            showConfirmButton: false,
                            timer: 3000,
                            timerProgressBar: true,
                            closeOnConfirm: false,
                            didOpen: (toast) => {
                              const progressBar = toast.querySelector('.swal2-timer-progress-bar');
                              if (progressBar) {
                                progressBar.style.backgroundColor = 'green';
                              }
                              
                              toast.addEventListener('mouseenter', Swal.stopTimer)
                              toast.addEventListener('mouseleave', Swal.resumeTimer)
                            }
                        });      
                        fetchCustomers();
                    } else {
                        Swal.fire({
                            icon: 'error',
                            title: `Error! `,
                            toast: true,
                            position: 'top',
                            showConfirmButton: false,
                            timer: 3000,
                            timerProgressBar: true,
                            closeOnConfirm: false,
                            didOpen: (toast) => {
                              const progressBar = toast.querySelector('.swal2-timer-progress-bar');
                              if (progressBar) {
                                progressBar.style.backgroundColor = 'black';
                              }
                              
                              toast.addEventListener('mouseenter', Swal.stopTimer)
                              toast.addEventListener('mouseleave', Swal.resumeTimer)
                            }
                        });
                    }
                } catch (error) {
                    if(error.response){
                        Swal.fire({
                            icon: 'error',
                            title: `Error: ${ error?.response?.data?.detail[0]?.msg || error?.response?.data?.detail }`,
                            toast: true,
                            position: 'top',
                            showConfirmButton: false,
                            timer: 3000,
                            timerProgressBar: true,
                            closeOnConfirm: false,
                            didOpen: (toast) => {
                              const progressBar = toast.querySelector('.swal2-timer-progress-bar');
                              if (progressBar) {
                                progressBar.style.backgroundColor = 'black';
                              }
                              
                              toast.addEventListener('mouseenter', Swal.stopTimer)
                              toast.addEventListener('mouseleave', Swal.resumeTimer)
                            }
                        });
                    } else if(error.request){
                        Swal.fire({
                            icon: 'error',
                            title: `Error: ${ error?.request?.data?.detail[0]?.msg || error?.request?.data?.detail }`,
                            toast: true,
                            position: 'top',
                            showConfirmButton: false,
                            timer: 3000,
                            timerProgressBar: true,
                            closeOnConfirm: false,
                            didOpen: (toast) => {
                              const progressBar = toast.querySelector('.swal2-timer-progress-bar');
                              if (progressBar) {
                                progressBar.style.backgroundColor = 'black';
                              }
                              
                              toast.addEventListener('mouseenter', Swal.stopTimer)
                              toast.addEventListener('mouseleave', Swal.resumeTimer)
                            }
                        });
                    } else {
                        Swal.fire({
                            icon: 'error',
                            title: `Error! try again.`,
                            toast: true,
                            position: 'top',
                            showConfirmButton: false,
                            timer: 3000,
                            timerProgressBar: true,
                            closeOnConfirm: false,
                            didOpen: (toast) => {
                              const progressBar = toast.querySelector('.swal2-timer-progress-bar');
                              if (progressBar) {
                                progressBar.style.backgroundColor = 'black';
                              }
                              
                              toast.addEventListener('mouseenter', Swal.stopTimer)
                              toast.addEventListener('mouseleave', Swal.resumeTimer)
                            }
                        });
                    }
                }
            }
        });
    }; 
    

    const resetNewCustomerForm = () => {
        setNewCustomerData({
            name: '',
            email: '',
            phone: '',
            user_type: 'customer',
            password: ''
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
                    row?.disabled ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"
                }`}>
                    {row?.disabled ? "Inactive" : "Active"}
                </span>
            ),
        },
        { 
            name: 'Registered At', 
            selector: row => moment(row?.registered_at).format('LLL'), 
            width: '15%' 
        }, 
        { 
            name: 'Actions', 
            cell: row => (
                <div className="">
                    <button 
                        className="m-1 px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 text-sm"
                        onClick={() => {
                            setSelectedCustomer(row);
                            setViewModal(true);
                        }}
                    >
                        View
                    </button>
                    <button 
                        className="m-1 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                        onClick={() => {
                            setSelectedCustomer(row);
                            setEditCustomerData({
                                name: row?.name,
                                email: row?.email,
                                phone: row?.phone,
                                disabled: row?.disabled
                            });
                            setEditModal(true);
                        }}
                    >
                        Edit
                    </button>
                    <button 
                        className="m-1 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                        onClick={() => handleDeleteCustomer(row)}
                    >
                        Delete
                    </button>
                </div>
            ),
            width: '20%'
        }
    ];

    return (
        <div className="p-2">
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
                        placeholder="Search Customers..."
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
                paginationRowsPerPageOptions={[10, 20, 50, 100]}
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
                
                <form onSubmit={handleCreateCustomer} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                        <input
                            type="text"
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={newCustomerData.name}
                            onChange={(e) => setNewCustomerData({...newCustomerData, name: e.target.value})}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                            type="email"
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={newCustomerData.email}
                            onChange={(e) => setNewCustomerData({...newCustomerData, email: e.target.value})}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                        <input
                            type="text"
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={newCustomerData.phone}
                            onChange={(e) => setNewCustomerData({...newCustomerData, phone: e.target.value})}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                        <input
                            type="password"
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={newCustomerData.password}
                            onChange={(e) => setNewCustomerData({...newCustomerData, password: e.target.value})}
                            placeholder="Leave blank to use default (email+phone)"
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
                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
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
                
                {selectedCustomer && (
                    <div className="space-y-4">
                        <div>
                            <p className="text-sm text-gray-500">Name</p>
                            <p className="text-gray-800">{selectedCustomer?.name}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Email</p>
                            <p className="text-gray-800">{selectedCustomer?.email}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Phone</p>
                            <p className="text-gray-800">{selectedCustomer?.phone}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Status</p>
                            <span className={`px-2 py-1 rounded-full text-xs ${
                                selectedCustomer?.disabled ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"
                            }`}>
                                {selectedCustomer?.disabled ? "Inactive" : "Active"}
                            </span>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Registered At</p>
                            <p className="text-gray-800">{moment(selectedCustomer?.registered_at).format('LLL')}</p>
                        </div>
                    </div>
                )}
                
                <div className="flex justify-end pt-6">
                    <button 
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
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
                
                <form onSubmit={handleUpdateCustomer} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                        <input
                            type="text"
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={editCustomerData.name}
                            onChange={(e) => setEditCustomerData({...editCustomerData, name: e.target.value})}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                            type="email"
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-100"
                            value={editCustomerData.email}
                            onChange={(e) => setEditCustomerData({...editCustomerData, email: e.target.value})}
                            required
                            disabled
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                        <input
                            type="text"
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={editCustomerData.phone}
                            onChange={(e) => setEditCustomerData({...editCustomerData, phone: e.target.value})}
                            required
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Active Status</label>
                        <select
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={editCustomerData.disabled ? 'inactive' : 'active'}
                            onChange={(e) => { 
                                setEditCustomerData({
                                    ...editCustomerData, 
                                    disabled: e.target.value === 'inactive'
                                })
                            }}
                        >
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </select>
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
                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
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