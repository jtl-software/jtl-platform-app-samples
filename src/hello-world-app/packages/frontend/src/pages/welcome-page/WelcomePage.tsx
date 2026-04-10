import { Card, CardHeader, CardTitle, CardDescription, CardContent, Text, Badge, Stack, Separator, Box } from '@jtl-software/platform-ui-react';
import { CircleCheck, ArrowRight } from 'lucide-react';

const routes = [
  { path: '/setup', description: 'Initial app setup and tenant connection' },
  { path: '/erp', description: 'ERP integration and data display' },
  { path: '/pane', description: 'Context-aware customer sidebar panel' },
];

const nextSteps = [
  'Register your app in the JTL Developer Portal',
  'Configure your backend environment variables',
  'Read the Platform App documentation',
];

const WelcomePage: React.FC = () => {
  return (
    <Box className="flex justify-center p-12">
      <Card className="max-w-[520px] w-full">
        <CardHeader className="items-center">
          <CircleCheck size={40} color="#10b981" strokeWidth={1.5} />
          <CardTitle>Your app is running!</CardTitle>
          <CardDescription className="text-center">The Hello World app template is set up and ready for development.</CardDescription>
        </CardHeader>
        <CardContent>
          <Stack spacing="5" direction="column">
            <Stack spacing="3" direction="column">
              <Text type="xs" weight="semibold" color="muted">
                AVAILABLE ROUTES
              </Text>
              {routes.map(route => (
                <Stack key={route.path} spacing="3" direction="row" itemAlign="center">
                  <Badge variant="outline" label={route.path} />
                  <Text type="small" color="muted">
                    {route.description}
                  </Text>
                </Stack>
              ))}
            </Stack>

            <Separator />

            <Stack spacing="3" direction="column">
              <Text type="xs" weight="semibold" color="muted">
                NEXT STEPS
              </Text>
              {nextSteps.map(step => (
                <Stack key={step} spacing="2" direction="row" itemAlign="center">
                  <ArrowRight size={14} className="opacity-40 shrink-0" />
                  <Text type="small">{step}</Text>
                </Stack>
              ))}
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
};

export default WelcomePage;
