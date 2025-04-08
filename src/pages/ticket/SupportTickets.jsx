import React from 'react';
import { Card } from '@material-tailwind/react';
import SupportTicketsManagement from './SupportTicketsManagement';
import SupportTicketsPatch from './SupportTicketsPatch';

const SupportTickets = () => {
    const search = window.location.search;
    const params = new URLSearchParams(search)

    console.log(params.get('email'))
    return (
        <div>
            <div className="relative mt-8 h-72 w-full overflow-hidden rounded-xl bg-[url('/img/background-image.png')] bg-cover bg-center shadow-lg transition-all duration-300 hover:shadow-xl">
                <div className="justify-center pt-6 text-center text-3xl font-bold text-white md:text-4xl lg:text-5xl">
                    Ticket Management
                </div>
                {
                    params.get('name') ?
                        <div> 
                        <p className="justify-center p-0 text-center text-1xl text-white " >
                        { params.get('name') }
                        </p>
                            <p className="justify-center p-0 text-center text-1xl text-white " >
                            { params.get('name') }
                            </p>
                            <p className="justify-center p-0 text-center text-1xl text-white " >
                            { params.get('name') }
                            </p>
                        </div> 
                        : ""
                }
            </div>

            <Card className="mx-0 -mt-36 mb-6 lg:mx-4 border border-blue-gray-100">
                {
                    params.get('userId') ?
                        <SupportTicketsPatch />
                        : <SupportTicketsManagement />
                }

            </Card>
        </div>
    );
};


export default SupportTickets;