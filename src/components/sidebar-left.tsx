import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '@/components/ui/sidebar';
import { useSidebar } from '@/hooks/useSidebar';
import { useGameStore } from '@/stores/gameStore';
import { Rocket } from 'lucide-react';

const data = {
  navMain: [
    {
      title: 'Operations',
      url: '#',
      items: [
        { title: 'Dashboard', url: '#', action: 'navigateDashboard' },
        { title: 'Resources', url: '#', action: 'toggleResources' },
      ],
    },
    {
      title: 'System',
      url: '#',
      items: [
        { title: 'Settings', url: '#', action: 'navigateSettings' },
      ],
    },
  ],
};

export function SidebarLeft({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const { toggleSidebar: toggleRightSidebar, open: rightOpen } =
    useSidebar('right');
  const setActiveView = useGameStore(state => state.setActiveView);
  const activeView = useGameStore(state => state.ui.activeView);

  const handleAction = (action: string) => {
    switch (action) {
      case 'toggleResources':
        toggleRightSidebar();
        break;
      case 'navigateDashboard':
        setActiveView('dashboard');
        break;
      case 'navigateSettings':
        setActiveView('settings');
        break;
    }
  };

  return (
    <Sidebar className="border-r-0 min-h-screen" collapsible="none" {...props}>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2">
          <Rocket className="w-6 h-6 text-primary" />
          <h1 className="text-lg font-bold text-sidebar-foreground">
            Space Salvage Empire
          </h1>
        </div>
      </SidebarHeader>
      <SidebarContent>
        {/* Navigation groups */}
        {data.navMain.map(item => (
          <SidebarGroup key={item.title}>
            <SidebarGroupLabel>{item.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {item.items.map(sub => (
                  <SidebarMenuItem key={sub.title}>
                    <SidebarMenuButton
                      asChild={sub.action ? false : true}
                      isActive={
                        sub.action === 'toggleResources'
                          ? rightOpen
                          : sub.action === 'navigateDashboard'
                            ? activeView === 'dashboard'
                            : sub.action === 'navigateSettings'
                              ? activeView === 'settings'
                              : false
                      }
                      onClick={
                        sub.action
                          ? () => handleAction(sub.action!)
                          : undefined
                      }
                      style={
                        sub.action === 'toggleResources' && rightOpen
                          ? { backgroundColor: '#16a34a', color: 'white', fontWeight: 'bold' }
                          : undefined
                      }
                    >
                      {sub.action ? (
                        sub.title
                      ) : (
                        <a href={sub.url}>{sub.title}</a>
                      )}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
