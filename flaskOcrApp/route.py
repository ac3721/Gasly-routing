import googlemaps
from datetime import datetime

class RouteDetourCalculator:
    """Calculate detours for sites between a start and end destination using Google Maps API."""
    
    def __init__(self, api_key):
        """
        Initialize the calculator with Google Maps API key.
        
        Args:
            api_key (str): Your Google Maps API key
        """
        self.gmaps = googlemaps.Client(key=api_key)
    
    def get_distance(self, origin, destination, mode='driving'):
        """
        Get distance between two points using Google Maps Distance Matrix API.
        
        Args:
            origin: Start location (address string or (lat, lng) tuple)
            destination: End location (address string or (lat, lng) tuple)
            mode: Travel mode ('driving', 'walking', 'bicycling', 'transit')
        
        Returns:
            dict: Distance in meters and duration in seconds, or None if error
        """
        try:
            result = self.gmaps.distance_matrix(
                origins=[origin],
                destinations=[destination],
                mode=mode,
                units='metric',
                departure_time=datetime.now()
            )
            
            if result['rows'][0]['elements'][0]['status'] == 'OK':
                distance = result['rows'][0]['elements'][0]['distance']['value']  # meters
                duration = result['rows'][0]['elements'][0]['duration']['value']  # seconds
                return {
                    'distance_meters': distance,
                    'distance_km': distance / 1000,
                    'distance_miles': distance / 1609.34,
                    'duration_seconds': duration,
                    'duration_minutes': duration / 60
                }
            else:
                print(f"Error: {result['rows'][0]['elements'][0]['status']}")
                return None
        except Exception as e:
            print(f"Error getting distance: {e}")
            return None
    
    def calculate_detour(self, start, end, site, mode='driving'):
        """
        Calculate the detour distance when visiting a site between start and end.
        
        Args:
            start: Starting location
            end: Ending location
            site: Site to visit
            mode: Travel mode
        
        Returns:
            dict: Detour information including distances and extra distance
        """
        # Get direct distance from start to end
        direct = self.get_distance(start, end, mode)
        
        if direct is None:
            return None
        
        # Get distance from start to site
        start_to_site = self.get_distance(start, site, mode)
        
        if start_to_site is None:
            return None
        
        # Get distance from site to end
        site_to_end = self.get_distance(site, end, mode)
        
        if site_to_end is None:
            return None
        
        # Calculate detour
        detour_distance = start_to_site['distance_meters'] + site_to_end['distance_meters']
        extra_distance = detour_distance - direct['distance_meters']
        
        detour_duration = start_to_site['duration_seconds'] + site_to_end['duration_seconds']
        extra_duration = detour_duration - direct['duration_seconds']
        
        return {
            'site': site,
            'direct_distance_km': direct['distance_km'],
            'direct_distance_miles': direct['distance_miles'],
            'direct_duration_minutes': direct['duration_minutes'],
            'detour_distance_km': detour_distance / 1000,
            'detour_distance_miles': detour_distance / 1609.34,
            'detour_duration_minutes': detour_duration / 60,
            'extra_distance_km': extra_distance / 1000,
            'extra_distance_miles': extra_distance / 1609.34,
            'extra_duration_minutes': extra_duration / 60,
            'start_to_site_km': start_to_site['distance_km'],
            'site_to_end_km': site_to_end['distance_km']
        }
    
    def calculate_all_detours(self, start, end, sites, mode='driving'):
        """
        Calculate detours for all sites and sort by extra distance.
        
        Args:
            start: Starting location
            end: Ending location
            sites: List of sites to check
            mode: Travel mode
        
        Returns:
            list: Sorted list of detour information (smallest detour first)
        """
        detours = []
        
        print(f"\nCalculating detours from '{start}' to '{end}'...")
        print(f"Checking {len(sites)} sites...\n")
        
        for i, site in enumerate(sites, 1):
            print(f"Processing site {i}/{len(sites)}: {site}")
            detour = self.calculate_detour(start, end, site, mode)
            
            if detour:
                detours.append(detour)
        
        # Sort by extra distance (smallest detour first)
        detours.sort(key=lambda x: x['extra_distance_km'])
        
        return detours
    
    def print_detour_results(self, detours, unit='km'):
        """
        Print detour results in a formatted table.
        
        Args:
            detours: List of detour dictionaries
            unit: 'km' or 'miles'
        """
        if not detours:
            print("No detours calculated.")
            return
        
        # Print header
        print("\n" + "="*100)
        print("DETOUR ANALYSIS RESULTS")
        print("="*100)
        
        # Print direct route info
        direct_dist = detours[0]['direct_distance_km'] if unit == 'km' else detours[0]['direct_distance_miles']
        direct_time = detours[0]['direct_duration_minutes']
        unit_label = unit
        
        print(f"\nDirect Route: {direct_dist:.2f} {unit_label} ({direct_time:.1f} minutes)")
        print("\n" + "-"*100)
        
        # Print table header
        if unit == 'km':
            print(f"{'#':<4} {'Site':<40} {'Detour':<15} {'Extra':<15} {'Time':<15}")
        else:
            print(f"{'#':<4} {'Site':<40} {'Detour':<15} {'Extra':<15} {'Time':<15}")
        print("-"*100)
        
        # Print each detour
        for i, detour in enumerate(detours, 1):
            site = detour['site']
            if isinstance(site, tuple):
                site_str = f"({site[0]:.4f}, {site[1]:.4f})"
            else:
                site_str = str(site)[:38]
            
            if unit == 'km':
                detour_dist = detour['detour_distance_km']
                extra_dist = detour['extra_distance_km']
            else:
                detour_dist = detour['detour_distance_miles']
                extra_dist = detour['extra_distance_miles']
            
            extra_time = detour['extra_duration_minutes']
            
            print(f"{i:<4} {site_str:<40} {detour_dist:.2f} {unit_label:<8} +{extra_dist:.2f} {unit_label:<8} +{extra_time:.1f} min")
        
        print("="*100 + "\n")


def main():
    """Example usage of RouteDetourCalculator."""
    
    # IMPORTANT: Replace with your actual Google Maps API key
    API_KEY = "YOUR_API_KEY_HERE"
    
    # Initialize calculator
    calculator = RouteDetourCalculator(API_KEY)
    
    # Define start and end destinations
    start = "New York, NY"
    end = "Boston, MA"
    
    # Define sites to check
    sites = [
        "Hartford, CT",
        "Providence, RI",
        "New Haven, CT",
        "Stamford, CT",
        "Worcester, MA"
    ]
    
    # You can also use coordinates instead of addresses:
    # start = (40.7128, -74.0060)  # New York
    # end = (42.3601, -71.0589)    # Boston
    # sites = [(41.7658, -72.6734)]  # Hartford
    
    # Calculate detours for all sites
    detours = calculator.calculate_all_detours(start, end, sites, mode='driving')
    
    # Print results
    calculator.print_detour_results(detours, unit='miles')  # or unit='km'
    
    # Access individual detour data
    if detours:
        print("\nClosest site (smallest detour):")
        closest = detours[0]
        print(f"  Site: {closest['site']}")
        print(f"  Extra distance: {closest['extra_distance_miles']:.2f} miles")
        print(f"  Extra time: {closest['extra_duration_minutes']:.1f} minutes")


if __name__ == "__main__":
    main()
