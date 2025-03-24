import {
  HomeIcon,
  UserCircleIcon,
  UserGroupIcon,
  UserPlusIcon,
  CircleStackIcon,
  TableCellsIcon, 
  InformationCircleIcon,
  ServerStackIcon,
  RectangleStackIcon,
  Cog6ToothIcon,
  TicketIcon,
} from "@heroicons/react/24/solid";
import { Home, Profile, Tables, Notifications } from "@/pages/dashboard";
import { SignIn, SignUp } from "@/pages/auth";

const icon = {
  className: "w-5 h-5 text-inherit",
};

export const routes = [
  {
    layout: "dashboard",
    pages: [
      {
        icon: <HomeIcon {...icon} />,
        name: "dashboard",
        path: "/home",
        element: <Home />,
      },
      {
        icon: <UserGroupIcon {...icon} />,
        name: "customer",
        path: "/customer",
        element: <Profile />,
      },
      {
        icon: <UserPlusIcon {...icon} />,
        name: "rider",
        path: "/rider",
        element: <Profile />,
      },
      {
        icon: <CircleStackIcon {...icon} />,
        name: "ride",
        path: "/ride",
        element: <Profile />,
      },
      // {
      //   icon: <TableCellsIcon {...icon} />,
      //   name: "tables",
      //   path: "/tables",
      //   element: <Tables />,
      // },
      // {
      //   icon: <InformationCircleIcon {...icon} />,
      //   name: "notifications",
      //   path: "/notifications",
      //   element: <Notifications />,
      // },
    ],
  },
  {
    title: "Internal",
    layout: "dashboard",
    pages: [
      {
        icon: <ServerStackIcon {...icon} />,
        name: "staff",
        path: "/staff",
        // element: <SignIn />,
      },
      {
        icon: <TicketIcon {...icon} />,
        name: "ticket",
        path: "/ticket",
        // element: <SignUp />,
      },
      {
        icon: <Cog6ToothIcon {...icon} />,
        name: "setting",
        path: "/setting",
        // element: <SignUp />,
      },
    ],
  },
];

export default routes;
