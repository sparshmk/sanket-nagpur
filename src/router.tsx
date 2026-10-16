import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { ResponseDashboard } from './pages/ResponseDashboard';
import { RequestQueue } from './pages/RequestQueue';
import { RequestDetails } from './pages/RequestDetails';
import { ResidentReport } from './pages/ResidentReport';
import { RequestTracking } from './pages/RequestTracking';
import { ResourceInventory } from './pages/ResourceInventory';
import { IncidentMap } from './pages/IncidentMap';
import { AuditHistory } from './pages/AuditHistory';
import { LandingOrRedirect } from './pages/LandingOrRedirect';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <LandingOrRedirect />,
  },
  {
    path: '/report',
    element: <ResidentReport />,
  },
  {
    path: '/track',
    element: <Navigate to="/track/SN-2026-0842" replace />,
  },
  {
    path: '/track/:requestId',
    element: <RequestTracking />,
  },
  {
    path: '/desk',
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: <ResponseDashboard />,
      },
      {
        path: 'requests',
        element: <RequestQueue />,
      },
      {
        path: 'requests/:requestId',
        element: <RequestDetails />,
      },
      {
        path: 'resources',
        element: <ResourceInventory />,
      },
      {
        path: 'map',
        element: <IncidentMap />,
      },
      {
        path: 'audit',
        element: <AuditHistory />,
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);
