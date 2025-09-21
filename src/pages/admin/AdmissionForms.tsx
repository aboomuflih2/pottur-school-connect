import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { djangoAPI } from "@/lib/django-api";
import { Save, Settings } from "lucide-react";

interface AdmissionForm {
  id: string;
  form_type: string;
  is_active: boolean;
  academic_year: string;
}

export default function AdmissionForms() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [kgStdYear, setKgStdYear] = useState("");
  const [plusOneYear, setPlusOneYear] = useState("");

  const { data: forms = [], isLoading } = useQuery<AdmissionForm[], Error>({
    queryKey: ['admissionForms'],
    queryFn: async () => {
        // @ts-ignore
        const response = await djangoAPI.getAdmissionForms();
        // @ts-ignore
        return response.results;
    },
    onSuccess: (data) => {
        const kgStd = data.find(f => f.form_type === 'kg_std');
        const plusOne = data.find(f => f.form_type === 'plus_one');
        if (kgStd) setKgStdYear(kgStd.academic_year);
        if (plusOne) setPlusOneYear(plusOne.academic_year);
    }
  });

  const mutationOptions = {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admissionForms'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  };

  const updateFormMutation = useMutation({
    mutationFn: ({ formType, data }: { formType: string, data: any }) => djangoAPI.updateAdmissionForm(formType, data),
    ...mutationOptions,
  });

  const handleStatusChange = (formType: string, isActive: boolean) => {
    const form = forms.find(f => f.form_type === formType);
    if (form) {
        updateFormMutation.mutate({ formType, data: { ...form, is_active: isActive } });
    }
  };

  const handleYearChange = (formType: string) => {
    const form = forms.find(f => f.form_type === formType);
    const academic_year = formType === 'kg_std' ? kgStdYear : plusOneYear;
    if (form) {
        updateFormMutation.mutate({ formType, data: { ...form, academic_year } });
    }
  };


  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const kgStdForm = forms.find(f => f.form_type === 'kg_std');
  const plusOneForm = forms.find(f => f.form_type === 'plus_one');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Settings className="w-6 h-6" />
          Admission Forms Management
        </h1>
        <p className="text-muted-foreground">
          Control the availability and settings of admission forms
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* KG & STD Form */}
        <Card>
          <CardHeader>
            <CardTitle>KG & STD Application Form</CardTitle>
            <CardDescription>
              Manage the kindergarten and standard classes application form
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="kg-std-toggle" className="text-base">
                  Form Status
                </Label>
                <div className="text-sm text-muted-foreground">
                  {kgStdForm?.is_active ? "Form is currently active" : "Form is currently inactive"}
                </div>
              </div>
              <Switch
                id="kg-std-toggle"
                checked={kgStdForm?.is_active || false}
                onCheckedChange={(checked) => handleStatusChange('kg_std', checked)}
                disabled={updateFormMutation.isPending}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="kg-std-year">Academic Year</Label>
              <div className="flex gap-2">
                <Input
                  id="kg-std-year"
                  value={kgStdYear}
                  onChange={(e) => setKgStdYear(e.target.value)}
                  placeholder="e.g., 2026-27"
                />
                <Button
                  onClick={() => handleYearChange('kg_std')}
                  disabled={updateFormMutation.isPending}
                  size="sm"
                >
                  <Save className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="pt-2 text-sm text-muted-foreground">
              <p><strong>Form includes:</strong></p>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li>Student details with stage selection (LKG to STD 10)</li>
                <li>Conditional Madrassa section (STD 1-7)</li>
                <li>Parent and address information</li>
                <li>Previous school details (STD 1-10)</li>
                <li>Siblings information</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* +1 / HSS Form */}
        <Card>
          <CardHeader>
            <CardTitle>+1 / HSS Application Form</CardTitle>
            <CardDescription>
              Manage the higher secondary school application form
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="plus-one-toggle" className="text-base">
                  Form Status
                </Label>
                <div className="text-sm text-muted-foreground">
                  {plusOneForm?.is_active ? "Form is currently active" : "Form is currently inactive"}
                </div>
              </div>
              <Switch
                id="plus-one-toggle"
                checked={plusOneForm?.is_active || false}
                onCheckedChange={(checked) => handleStatusChange('plus_one', checked)}
                disabled={updateFormMutation.isPending}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="plus-one-year">Academic Year</Label>
              <div className="flex gap-2">
                <Input
                  id="plus-one-year"
                  value={plusOneYear}
                  onChange={(e) => setPlusOneYear(e.target.value)}
                  placeholder="e.g., 2025-26"
                />
                <Button
                  onClick={() => handleYearChange('plus_one')}
                  disabled={updateFormMutation.isPending}
                  size="sm"
                >
                  <Save className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="pt-2 text-sm text-muted-foreground">
              <p><strong>Form includes:</strong></p>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li>Personal and parent details</li>
                <li>Complete address with landmark</li>
                <li>10th standard academic details</li>
                <li>Stream selection (Biology, Computer, Commerce)</li>
                <li>Siblings information</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick Statistics</CardTitle>
          <CardDescription>Overview of current admission forms status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center">
              <p className="text-2xl font-bold">
                {forms.filter(f => f.is_active).length}
              </p>
              <p className="text-sm text-muted-foreground">Active Forms</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">
                {forms.length}
              </p>
              <p className="text-sm text-muted-foreground">Total Forms</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">
                {new Date().getFullYear()}
              </p>
              <p className="text-sm text-muted-foreground">Current Year</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
