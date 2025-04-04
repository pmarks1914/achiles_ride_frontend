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

const RiderManagement = () => {
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
        user_type: 'rider',
        license_number: '',
        vehicle_registration: '',
        vehicle_type: 'motorcycle'
    });
    
    const [selectedRider, setSelectedRider] = useState(null);
    const [editRiderData, setEditRiderData] = useState({});

    useEffect(() => {
        fetchRiders();
    }, [currentPage, pageSize, searchText]);

    const fetchRiders = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${apiUrl}/api/user/`, {
                params: {
                    page: currentPage,
                    per_page: pageSize,
                    start_date: dateRange[0] ? moment(dateRange[0]).format('YYYY-MM-DD') : null,
                    end_date: dateRange[1] ? moment(dateRange[1]).format('YYYY-MM-DD') : null,
                    search: searchText,
                    user_type: 'rider'
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
            toast.error("Error fetching rider data");
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
            const response = await axios.post(`${apiUrl}/api/user/riders/`, 
                {
                    name: newRiderData.name,
                    email: newRiderData.email,
                    phone: newRiderData.phone,
                    user_type: 'rider',
                    license_number: newRiderData.license_number,
                    vehicle_registration: newRiderData.vehicle_registration,
                    vehicle_type: newRiderData.vehicle_type,
                    password: `${newRiderData.email}${newRiderData.phone}`,
                    disabled: false
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
                setCreateModal(false);
                fetchRiders();
                resetNewRiderForm();
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

    const handleUpdateRider = async (e) => {
        e.preventDefault();
        console.log(editRiderData)
        try {
            const response = await axios.patch(
                `${apiUrl}/api/user/${selectedRider?.user_id}`,
                {
                    ...editRiderData,
                    user_type: 'rider'
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
                fetchRiders();
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
                        `${apiUrl}/api/user/${rider?.user_id}`,
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
                        fetchRiders();
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
    

    const resetNewRiderForm = () => {
        setNewRiderData({
            name: '',
            email: '',
            phone: '',
            user_type: 'rider',
            license_number: '',
            vehicle_registration: '',
            vehicle_type: 'motorcycle'
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
            name: 'License No.', 
            selector: row => row?.riders?.[0]?.license_number, 
            width: '15%' 
        },
        { 
            name: 'Vehicle', 
            cell: row => (
                <span>
                    {row?.riders?.[0]?.vehicle_registration}
                </span>
            ),
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
                                disabled: row?.disabled,
                                license_number: row?.riders?.[0]?.license_number,
                                vehicle_registration: row?.riders?.[0]?.vehicle_registration,
                                vehicle_type: row?.riders?.[0]?.vehicle_type || 'motorcycle'
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
                    Add New Rider
                </Button>
                <div className="w-full md:w-64">
                    <input
                        type="text"
                        className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Search Riders..."
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

            {/* Create Rider Modal */}
            <aside
                className={`fixed top-0 right-0 z-50 h-screen w-96 bg-white px-6 shadow-lg transition-transform duration-300 ${
                    createModal ? "translate-x-0" : "translate-x-full"
                }`}
            >
                <div className="flex items-start justify-between pt-8 pb-6">
                    <div>
                        <h5 className="text-xl font-semibold text-gray-800">Add New Rider</h5>
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
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">License Number</label>
                        <input
                            type="text"
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={newRiderData.license_number}
                            onChange={(e) => setNewRiderData({...newRiderData, license_number: e.target.value})}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Registration</label>
                        <input
                            type="text"
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={newRiderData.vehicle_registration}
                            onChange={(e) => setNewRiderData({...newRiderData, vehicle_registration: e.target.value})}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Type</label>
                        <Select
                            options={[
                                { value: 'motorcycle', label: 'Motorcycle' },
                                { value: 'car', label: 'Car' },
                                { value: 'bicycle', label: 'Bicycle' },
                                { value: 'truck', label: 'Truck' }
                            ]}
                            value={{
                                value: newRiderData.vehicle_type,
                                label: newRiderData.vehicle_type.charAt(0).toUpperCase() + newRiderData.vehicle_type.slice(1)
                            }}
                            onChange={(selected) => setNewRiderData({
                                ...newRiderData,
                                vehicle_type: selected.value
                            })}
                            className="basic-single"
                            classNamePrefix="select"
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
                            Create Rider
                        </button>
                    </div>
                </form>
            </aside>

            {/* View Rider Modal */}
            <aside
                className={`fixed top-0 right-0 z-50 h-screen w-96 bg-white px-6 shadow-lg transition-transform duration-300 ${
                    viewModal ? "translate-x-0" : "translate-x-full"
                }`}
            >
                <div className="flex items-start justify-between pt-8 pb-6">
                    <div>
                        <h5 className="text-xl font-semibold text-gray-800">Rider Details</h5>
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
                            <p className="text-sm text-gray-500">License Number</p>
                            <p className="text-gray-800">{selectedRider?.riders?.[0]?.license_number}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Vehicle Registration</p>
                            <p className="text-gray-800">{selectedRider?.riders?.[0]?.vehicle_registration}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Vehicle Type</p>
                            <p className="text-gray-800">
                                {selectedRider?.riders?.[0]?.vehicle_type?.charAt(0).toUpperCase() + selectedRider?.riders?.[0]?.vehicle_type?.slice(1)}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Status</p>
                            <span className={`px-2 py-1 rounded-full text-xs ${
                                selectedRider?.disabled ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"
                            }`}>
                                {selectedRider?.disabled ? "Inactive" : "Active"}
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
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                        onClick={() => setViewModal(false)}
                    >
                        Close
                    </button>
                </div>
            </aside>

            {/* Edit Rider Modal */}
            <aside
                className={`fixed top-0 right-0 z-50 h-screen w-96 bg-white px-6 shadow-lg transition-transform duration-300 ${
                    editModal ? "translate-x-0" : "translate-x-full"
                }`}
            >
                <div className="flex items-start justify-between pt-8 pb-6">
                    <div>
                        <h5 className="text-xl font-semibold text-gray-800">Edit Rider</h5>
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
                        <label className="block text-sm font-medium text-gray-700 mb-1">License Number</label>
                        <input
                            type="text"
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={editRiderData.license_number}
                            onChange={(e) => setEditRiderData({...editRiderData, license_number: e.target.value})}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Registration</label>
                        <input
                            type="text"
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={editRiderData.vehicle_registration}
                            onChange={(e) => setEditRiderData({...editRiderData, vehicle_registration: e.target.value})}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Type</label>
                        <Select
                            options={[
                                { value: 'motorcycle', label: 'Motorcycle' },
                                { value: 'car', label: 'Car' },
                                { value: 'bicycle', label: 'Bicycle' },
                                { value: 'truck', label: 'Truck' }
                            ]}
                            value={{
                                value: editRiderData.vehicle_type,
                                label: editRiderData.vehicle_type?.charAt(0).toUpperCase() + editRiderData.vehicle_type?.slice(1)
                            }}
                            onChange={(selected) => setEditRiderData({
                                ...editRiderData, 
                                vehicle_type: selected.value
                            })}
                            className="basic-single"
                            classNamePrefix="select"
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Active Status</label>
                        <Select
                            options={[
                                { value: false, label: 'Active' },
                                { value: true, label: 'Inactive' }
                            ]}
                            value={{
                                value: editRiderData.disabled,
                                label: editRiderData.disabled ? 'Inactive' : 'Active'
                            }}
                            onChange={(selected) => { setEditRiderData({
                                ...editRiderData, 
                                disabled: selected.value
                                })
                            }}
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
                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                            Update Rider
                        </button>
                    </div>
                </form>
            </aside>
        </div>
    );
};

export default RiderManagement;