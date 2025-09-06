import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Send } from "lucide-react";

const formSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  gender: z.enum(["male", "female", "other"], { required_error: "Please select gender" }),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  stage: z.string().min(1, "Please select stage"),
  needMadrassa: z.boolean().default(false),
  previousMadrassa: z.string().optional(),
  fatherName: z.string().min(2, "Father's name is required"),
  motherName: z.string().min(2, "Mother's name is required"),
  houseName: z.string().min(2, "House name is required"),
  postOffice: z.string().min(2, "Post office is required"),
  village: z.string().min(2, "Village is required"),
  pincode: z.string().min(6, "Pincode must be at least 6 digits"),
  district: z.string().min(2, "District is required"),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  mobileNumber: z.string().min(10, "Mobile number must be at least 10 digits"),
  previousSchool: z.string().optional(),
  hasSiblings: z.boolean().default(false),
  siblingsNames: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

export function KGStdApplicationForm() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      needMadrassa: false,
      hasSiblings: false,
    }
  });

  const watchedStage = form.watch("stage");
  const watchedNeedMadrassa = form.watch("needMadrassa");
  const watchedHasSiblings = form.watch("hasSiblings");

  const showMadrassaSection = watchedStage && ["STD 1", "STD 2", "STD 3", "STD 4", "STD 5", "STD 6", "STD 7"].includes(watchedStage);
  const showPreviousMadrassa = showMadrassaSection && watchedNeedMadrassa && ["STD 2", "STD 3", "STD 4", "STD 5", "STD 6", "STD 7"].includes(watchedStage);
  const showPreviousSchool = watchedStage && ["STD 1", "STD 2", "STD 3", "STD 4", "STD 5", "STD 6", "STD 7", "STD 8", "STD 9", "STD 10"].includes(watchedStage);

  const generateApplicationNumber = () => {
    const year = new Date().getFullYear();
    const randomNum = Math.floor(Math.random() * 10000) + 1000;
    return `MHS${year}-${randomNum}`;
  };

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      const applicationNumber = generateApplicationNumber();
      
      const { error } = await supabase
        .from('kg_std_applications')
        .insert([{
          application_number: applicationNumber,
          full_name: data.fullName,
          gender: data.gender,
          date_of_birth: data.dateOfBirth,
          stage: data.stage,
          need_madrassa: data.needMadrassa,
          previous_madrassa: data.previousMadrassa || null,
          father_name: data.fatherName,
          mother_name: data.motherName,
          house_name: data.houseName,
          post_office: data.postOffice,
          village: data.village,
          pincode: data.pincode,
          district: data.district,
          email: data.email || null,
          mobile_number: data.mobileNumber,
          previous_school: data.previousSchool || null,
          has_siblings: data.hasSiblings,
          siblings_names: data.siblingsNames || null,
        }]);

      if (error) throw error;

      navigate(`/admissions/success?type=kg-std&app=${applicationNumber}`);
    } catch (error: any) {
      toast({
        title: "Submission Failed",
        description: error.message || "Failed to submit application. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const stages = ["LKG", "UKG", "STD 1", "STD 2", "STD 3", "STD 4", "STD 5", "STD 6", "STD 7", "STD 8", "STD 9", "STD 10"];

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <h1 className="text-2xl font-bold">KG & STD Application Form</h1>
          <p className="text-muted-foreground">Academic Year: 2026-27</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Student Details */}
            <Card>
              <CardHeader>
                <CardTitle>Student Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter student's full name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Gender</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex flex-row space-x-6"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="male" id="male" />
                            <label htmlFor="male">Male</label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="female" id="female" />
                            <label htmlFor="female">Female</label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="other" id="other" />
                            <label htmlFor="other">Other</label>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="dateOfBirth"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date of Birth</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="stage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Stage</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select stage" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {stages.map((stage) => (
                            <SelectItem key={stage} value={stage}>
                              {stage}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Madrassa Details (Conditional) */}
            {showMadrassaSection && (
              <Card>
                <CardHeader>
                  <CardTitle>Madrassa Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="needMadrassa"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Need Madrassa?</FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />

                  {showPreviousMadrassa && (
                    <FormField
                      control={form.control}
                      name="previousMadrassa"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Previous Madrassa</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter previous madrassa name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </CardContent>
              </Card>
            )}

            {/* Parent Details */}
            <Card>
              <CardHeader>
                <CardTitle>Parent Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="fatherName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Father's Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter father's name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="motherName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mother's Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter mother's name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Address */}
            <Card>
              <CardHeader>
                <CardTitle>Address</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="houseName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>House Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter house name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="postOffice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Post Office</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter post office" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="village"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Village</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter village" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="pincode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pincode</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter pincode" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="district"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>District</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter district" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Contact */}
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email (Optional)</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="Enter email address" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="mobileNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mobile Number</FormLabel>
                      <FormControl>
                        <Input type="tel" placeholder="Enter mobile number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Previous School (Conditional) */}
            {showPreviousSchool && (
              <Card>
                <CardHeader>
                  <CardTitle>Previous School Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name="previousSchool"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Previous School</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter previous school name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            )}

            {/* Siblings Details */}
            <Card>
              <CardHeader>
                <CardTitle>Siblings Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="hasSiblings"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Has siblings in this school?</FormLabel>
                      </div>
                    </FormItem>
                  )}
                />

                {watchedHasSiblings && (
                  <FormField
                    control={form.control}
                    name="siblingsNames"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Siblings' Names</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Enter siblings' names and their classes"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </CardContent>
            </Card>

            <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
              <Send className="w-4 h-4 mr-2" />
              {isSubmitting ? "Submitting..." : "Submit Application"}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}