import React from 'react';
import {
  Wifi as WifiIcon,
  Tv as TvIcon,
  AcUnit as AcIcon,
  LocalHotel as BedIcon,
  Balcony as BalconyIcon,
  Kitchen as KitchenIcon,
  LocalParking as ParkingIcon,
} from '@mui/icons-material';

export const AMENITY_OPTIONS = [
  { value: 'wifi', label: 'WiFi', icon: <WifiIcon fontSize="small" /> },
  { value: 'tv', label: 'TV', icon: <TvIcon fontSize="small" /> },
  { value: 'ac', label: 'AC', icon: <AcIcon fontSize="small" /> },
  { value: 'attached_bathroom', label: 'Attached Bathroom', icon: <BedIcon fontSize="small" /> },
  { value: 'balcony', label: 'Balcony', icon: <BalconyIcon fontSize="small" /> },
  { value: 'kitchen', label: 'Kitchen', icon: <KitchenIcon fontSize="small" /> }
];

export const ROOM_TYPE_OPTIONS = [
  { value: 'single', label: 'Single Room' },
  { value: 'sharing', label: 'Sharing Room' },
];

export const getAmenityIcon = (amenity: string) => {
  const option = AMENITY_OPTIONS.find(opt => opt.value === amenity);
  return option ? option.icon : <BedIcon fontSize="small" />;
};
