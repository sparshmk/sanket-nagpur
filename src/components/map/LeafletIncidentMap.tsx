import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { AssistanceRequest } from '../../types/request';
import { formatCategoryLabel } from '../../utils/formatting';
import { AlertTriangle, MapPin, Eye, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PriorityBadge, VerificationBadge } from '../ui/Badge';
import { Button } from '../ui/Button';

interface LeafletIncidentMapProps {
  requests: AssistanceRequest[];
  selectedRequestId?: string;
  onSelectRequest?: (req: AssistanceRequest) => void;
}

export const LeafletIncidentMap: React.FC<LeafletIncidentMapProps> = ({
  requests,
  selectedRequestId,
  onSelectRequest,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersGroupRef = useRef<L.LayerGroup | null>(null);
  const [mapError, setMapError] = useState<string | null>(null);
  const [activePopupRequest, setActivePopupRequest] = useState<AssistanceRequest | null>(null);

  // Initialize Leaflet map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    try {
      // Nagpur center coordinates
      const nagpurCenter: [number, number] = [21.1458, 79.0882];

      const map = L.map(mapContainerRef.current, {
        center: nagpurCenter,
        zoom: 12,
        zoomControl: true,
        scrollWheelZoom: true,
      });

      // OpenStreetMap public tiles
      const tileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors | Synthetic Demo Markers',
        maxZoom: 18,
      });

      tileLayer.addTo(map);

      tileLayer.on('tileerror', () => {
        console.warn('Map tile failed to load, falling back gracefully');
      });

      const markersGroup = L.layerGroup().addTo(map);
      markersGroupRef.current = markersGroup;
      mapInstanceRef.current = map;

      // Fix leaflet tile sizing on resize
      setTimeout(() => {
        map.invalidateSize();
      }, 200);
    } catch (err) {
      console.error('Failed to initialize Leaflet map:', err);
      setMapError('Interactive map view could not load OpenStreetMap tiles. Displaying tabular incident data.');
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update markers when requests change
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersGroup = markersGroupRef.current;
    if (!map || !markersGroup) return;

    markersGroup.clearLayers();

    requests.forEach((req) => {
      const priority = req.priorityAssessment.currentPriority;
      const isCritical = priority === 'CRITICAL';
      const isHigh = priority === 'HIGH';
      const isSelected = req.id === selectedRequestId;

      const pinColor = isCritical ? '#DC2626' : isHigh ? '#D6A441' : '#14533B';
      const size = isSelected ? 34 : 26;

      const customIcon = L.divIcon({
        className: 'custom-map-marker',
        html: `
          <div style="
            background-color: ${pinColor};
            width: ${size}px;
            height: ${size}px;
            border-radius: 9999px;
            border: 2px solid white;
            box-shadow: 0 2px 6px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: ${isSelected ? '12px' : '10px'};
            font-weight: bold;
            cursor: pointer;
            transition: transform 0.15s ease;
          ">
            ${isCritical ? '!' : isHigh ? '▲' : '●'}
          </div>
        `,
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2],
      });

      const marker = L.marker(req.coordinates, { icon: customIcon });

      marker.on('click', () => {
        setActivePopupRequest(req);
        if (onSelectRequest) onSelectRequest(req);
        map.panTo(req.coordinates, { animate: true });
      });

      markersGroup.addLayer(marker);
    });

    // If a request is selected externally, center on it
    if (selectedRequestId) {
      const selected = requests.find((r) => r.id === selectedRequestId);
      if (selected) {
        map.setView(selected.coordinates, 14, { animate: true });
        setActivePopupRequest(selected);
      }
    }
  }, [requests, selectedRequestId, onSelectRequest]);

  if (mapError) {
    return (
      <div className="p-8 rounded-xl border border-amber-200 bg-amber-50 text-center text-ink-primary">
        <AlertTriangle className="w-8 h-8 text-amber-600 mx-auto mb-2" />
        <h4 className="font-semibold text-sm">Map Tiles Offline or Unavailable</h4>
        <p className="text-xs text-ink-secondary mt-1">{mapError}</p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[520px] rounded-xl border border-surface-border overflow-hidden bg-slate-100 shadow-subtle">
      {/* Leaflet container */}
      <div ref={mapContainerRef} className="w-full h-full z-10" />

      {/* Floating Demo Data Overlay */}
      <div className="absolute top-3 left-3 z-20 bg-white/95 backdrop-blur-xs px-3 py-1.5 rounded-lg border border-surface-border shadow-subtle text-xs flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        <span className="font-semibold text-ink-primary">Nagpur Incident GIS</span>
        <span className="text-ink-tertiary">|</span>
        <span className="text-amber-800 font-medium">Synthetic Demo Pins</span>
      </div>

      {/* Marker Legend */}
      <div className="absolute bottom-3 left-3 z-20 bg-white/95 backdrop-blur-xs p-2.5 rounded-lg border border-surface-border shadow-subtle text-xs space-y-1">
        <div className="font-semibold text-ink-secondary text-[11px] uppercase tracking-wider mb-1">
          Priority Pins
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-red-600 inline-block" />
          <span>Critical Urgency</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-amber-500 inline-block" />
          <span>High Urgency</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-brand-700 inline-block" />
          <span>Medium / Low Urgency</span>
        </div>
      </div>

      {/* Selected Marker Detail Card Popover */}
      {activePopupRequest && (
        <div className="absolute top-3 right-3 z-20 max-w-sm w-full bg-white rounded-xl border border-surface-border shadow-modal p-4 space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-ink-primary font-mono">
                  {activePopupRequest.id}
                </span>
                <PriorityBadge priority={activePopupRequest.priorityAssessment.currentPriority} size="sm" />
              </div>
              <div className="text-xs text-ink-secondary font-medium mt-0.5">
                {formatCategoryLabel(activePopupRequest.category)}
              </div>
            </div>
            <button
              onClick={() => setActivePopupRequest(null)}
              className="text-ink-tertiary hover:text-ink-primary text-xs p-1"
              aria-label="Close pin preview"
            >
              ✕
            </button>
          </div>

          <div className="text-xs text-ink-secondary space-y-1">
            <div className="flex items-start gap-1.5 text-ink-primary font-medium">
              <MapPin className="w-3.5 h-3.5 text-brand-700 shrink-0 mt-0.5" />
              <span>{activePopupRequest.locationName}</span>
            </div>
            <div className="line-clamp-2 text-ink-secondary mt-1">
              {activePopupRequest.description}
            </div>
            <div className="pt-1 flex items-center justify-between text-ink-tertiary">
              <span>Affected: <strong>{activePopupRequest.affectedCount} persons</strong></span>
              <VerificationBadge state={activePopupRequest.verificationState} size="sm" />
            </div>
          </div>

          <div className="pt-2 border-t border-surface-border flex items-center justify-end gap-2">
            <Link to={`/desk/requests/${activePopupRequest.id}`}>
              <Button size="sm" variant="primary" rightIcon={<ExternalLink className="w-3.5 h-3.5" />}>
                Open Request Workspace
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};
