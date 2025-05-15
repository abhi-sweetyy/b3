import React from 'react';

export const projectLabels = {
    "aboutProject": "About Project",
    "address": "Address",
    "amenities": "Amenities",
    "basicInfo": "Basic Info",
    "broker": "Broker",
    "commission": "Commission",
    "contactInfo": "Contact Info",
    "descriptions": "Descriptions",
    "energy": "Energy",
    "generateDocument": "Generate Document",
    "images": "Images",
    "propertyDetails": "Property Details",
    "propertyInfo": "Property Info",
    "viewProject": "View Project"
};

// If this is supposed to be a layout component, add proper component code:
const DashboardLayout: React.FC<{children: React.ReactNode}> = ({ children }) => {
    return (
        <div className="dashboard-layout">
            {children}
        </div>
    );
};

export default DashboardLayout; 