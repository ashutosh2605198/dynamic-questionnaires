import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Library, FileText, Users, BarChart3, ArrowRight, Zap, Shield, Palette } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <div className="container mx-auto px-6 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-primary-hover bg-clip-text text-transparent">
            FormCraft
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Create dynamic questionnaires with ease. Build comprehensive question libraries, 
            customize forms for your clients, and gather insights like never before.
          </p>
          <div className="flex gap-4 justify-center">
            <Button asChild size="lg">
              <Link to="/library">
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" size="lg">
              Learn More
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <Card className="text-center">
            <CardHeader>
              <Library className="h-8 w-8 text-primary mx-auto mb-2" />
              <CardTitle className="text-lg">Question Library</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Build reusable question collections organized in sections with multiple question types
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <FileText className="h-8 w-8 text-primary mx-auto mb-2" />
              <CardTitle className="text-lg">Dynamic Forms</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Create custom questionnaires by selecting from your question library for specific clients
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Users className="h-8 w-8 text-primary mx-auto mb-2" />
              <CardTitle className="text-lg">Client Management</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Manage your clients and track their questionnaire responses in one place
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <BarChart3 className="h-8 w-8 text-primary mx-auto mb-2" />
              <CardTitle className="text-lg">Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Gain insights from responses with comprehensive analytics and reporting tools
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* Key Benefits */}
        <div className="bg-card rounded-lg p-8 mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">Why Choose FormCraft?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <Zap className="h-10 w-10 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Lightning Fast</h3>
              <p className="text-muted-foreground">
                Create questionnaires in minutes, not hours. Our intuitive interface gets you up and running quickly.
              </p>
            </div>
            <div className="text-center">
              <Palette className="h-10 w-10 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Fully Customizable</h3>
              <p className="text-muted-foreground">
                Support for all question types including text, choices, files, dates, and more with full customization.
              </p>
            </div>
            <div className="text-center">
              <Shield className="h-10 w-10 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Secure & Reliable</h3>
              <p className="text-muted-foreground">
                Your data is safe with us. Built with modern security practices and reliable infrastructure.
              </p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-6">Ready to get started?</h2>
          <div className="flex gap-4 justify-center flex-wrap">
            <Button asChild variant="default">
              <Link to="/library">
                <Library className="mr-2 h-4 w-4" />
                Question Library
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/questionnaires">
                <FileText className="mr-2 h-4 w-4" />
                Questionnaires
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/clients">
                <Users className="mr-2 h-4 w-4" />
                Manage Clients
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
