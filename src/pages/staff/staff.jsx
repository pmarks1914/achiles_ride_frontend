import React from 'react';
import { Card } from '@material-tailwind/react';
import StaffManagement from './StaffManagement';

const Staff = () => {


    return (
        <div>
            <div className="relative mt-8 h-72 w-full overflow-hidden rounded-xl bg-[url('/img/background-image.png')] bg-cover bg-center shadow-lg transition-all duration-300 hover:shadow-xl">
                <div className="justify-center p-6 text-center text-3xl font-bold text-white md:text-4xl lg:text-5xl">
                    Staff Management
                </div>
            </div>

            <Card className="mx-0 -mt-36 mb-6 lg:mx-4 border border-blue-gray-100">

                <StaffManagement />

            </Card>
        </div>
    );
};

export default Staff;