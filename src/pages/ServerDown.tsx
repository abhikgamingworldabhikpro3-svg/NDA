import React from 'react';
import ServiceClosure from './ServiceClosure';

interface ServerDownProps {
  onRetry?: () => void;
  onAdminAccess?: () => void;
  onViewLaunch?: () => void;
}

export const ServerDown: React.FC<ServerDownProps> = ({ 
  onAdminAccess 
}) => {
  return (
    <ServiceClosure 
      onAdminAccess={onAdminAccess} 
    />
  );
};

export default ServerDown;
