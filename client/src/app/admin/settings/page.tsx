'use client';

import { useState } from 'react';
import { Settings, Shield, Database, Bell, Mail, Globe, Save, RefreshCw } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { toast } from 'sonner';

interface SystemSettings {
    election_name: string;
    organization_name: string;
    contact_email: string;
    auto_backup: boolean;
    email_notifications: boolean;
    maintenance_mode: boolean;
    voting_time_limit: number;
    max_candidates_per_position: number;
}

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState('general');
    const [isSaving, setIsSaving] = useState(false);

    const form = useForm<SystemSettings>({
        defaultValues: {
            election_name: 'Student Awards 2024',
            organization_name: 'University Name',
            contact_email: 'admin@university.edu',
            auto_backup: true,
            email_notifications: true,
            maintenance_mode: false,
            voting_time_limit: 300,
            max_candidates_per_position: 50
        }
    });

    const handleSave = async (data: SystemSettings) => {
        setIsSaving(true);
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 2000));
            toast.success('Settings saved successfully');
        } catch (error) {
            toast.error('Failed to save settings');
        } finally {
            setIsSaving(false);
        }
    };

    const settingsTabs = [
        { id: 'general', name: 'General', icon: Settings },
        { id: 'security', name: 'Security', icon: Shield },
        { id: 'database', name: 'Database', icon: Database },
        { id: 'notifications', name: 'Notifications', icon: Bell },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-white">System Settings</h1>
                    <p className="text-white/60 mt-1">Configure system preferences and behavior</p>
                </div>
                <button
                    onClick={form.handleSubmit(handleSave)}
                    disabled={isSaving}
                    className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 transition-all disabled:opacity-50 w-full sm:w-auto"
                >
                    {isSaving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
            </div>

            {/* Settings Tabs */}
            <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/20 p-2">
                <div className="flex flex-wrap sm:flex-nowrap space-x-1 gap-1">
                    {settingsTabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all flex-1 sm:flex-none justify-center ${
                                activeTab === tab.id
                                    ? 'bg-gradient-to-r from-white/20 to-white/10 text-white border border-white/30'
                                    : 'text-white/70 hover:text-white hover:bg-white/10'
                            }`}
                        >
                            <tab.icon className="h-4 w-4" />
                            <span className="hidden xs:inline">{tab.name}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Settings Content */}
            <Form {...form}>
                <form className="space-y-6">
                    {activeTab === 'general' && (
                        <GeneralSettings form={form} />
                    )}
                    {activeTab === 'security' && (
                        <SecuritySettings />
                    )}
                    {activeTab === 'database' && (
                        <DatabaseSettings />
                    )}
                    {activeTab === 'notifications' && (
                        <NotificationSettings form={form} />
                    )}
                </form>
            </Form>
        </div>
    );
}

function GeneralSettings({ form }: { form: any }) {
    return (
        <div className="space-y-6">
            <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/20 p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Organization Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="organization_name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-white/70">Organization Name</FormLabel>
                                <FormControl>
                                    <input
                                        {...field}
                                        className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder:text-white/50 focus:border-white/40 focus:ring-2 focus:ring-white/20 focus:outline-none"
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="contact_email"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-white/70">Contact Email</FormLabel>
                                <FormControl>
                                    <input
                                        {...field}
                                        type="email"
                                        className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder:text-white/50 focus:border-white/40 focus:ring-2 focus:ring-white/20 focus:outline-none"
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
            </div>

            <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/20 p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Voting Configuration</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="voting_time_limit"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-white/70">Voting Time Limit (seconds)</FormLabel>
                                <FormControl>
                                    <input
                                        {...field}
                                        type="number"
                                        className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder:text-white/50 focus:border-white/40 focus:ring-2 focus:ring-white/20 focus:outline-none"
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="max_candidates_per_position"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-white/70">Max Candidates per Position</FormLabel>
                                <FormControl>
                                    <input
                                        {...field}
                                        type="number"
                                        className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder:text-white/50 focus:border-white/40 focus:ring-2 focus:ring-white/20 focus:outline-none"
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
            </div>
        </div>
    );
}

function SecuritySettings() {
    return (
        <div className="space-y-6">
            <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/20 p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Access Control</h3>
                <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-lg bg-white/5">
                        <div>
                            <div className="font-medium text-white">Two-Factor Authentication</div>
                            <div className="text-sm text-white/60">Require 2FA for admin accounts</div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" />
                            <div className="w-11 h-6 bg-white/20 peer-focus:ring-2 peer-focus:ring-white/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                        </label>
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-lg bg-white/5">
                        <div>
                            <div className="font-medium text-white">Session Timeout</div>
                            <div className="text-sm text-white/60">Auto-logout after inactivity</div>
                        </div>
                        <select className="px-3 py-1 rounded bg-white/10 border border-white/20 text-white text-sm">
                            <option>30 minutes</option>
                            <option>1 hour</option>
                            <option>2 hours</option>
                            <option>Never</option>
                        </select>
                    </div>
                </div>
            </div>
        </div>
    );
}

function DatabaseSettings() {
    return (
        <div className="space-y-6">
            <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/20 p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Database Management</h3>
                <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-lg bg-white/5">
                        <div>
                            <div className="font-medium text-white">Automatic Backups</div>
                            <div className="text-sm text-white/60">Daily database backups</div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" defaultChecked />
                            <div className="w-11 h-6 bg-white/20 peer-focus:ring-2 peer-focus:ring-white/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                        </label>
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-lg bg-white/5">
                        <div>
                            <div className="font-medium text-white">Data Retention</div>
                            <div className="text-sm text-white/60">How long to keep voting records</div>
                        </div>
                        <select className="px-3 py-1 rounded bg-white/10 border border-white/20 text-white text-sm">
                            <option>1 year</option>
                            <option>2 years</option>
                            <option>5 years</option>
                            <option>Forever</option>
                        </select>
                    </div>
                </div>
            </div>
        </div>
    );
}

function NotificationSettings({ form }: { form: any }) {
    return (
        <div className="space-y-6">
            <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/20 p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Email Notifications</h3>
                <div className="space-y-4">
                    <FormField
                        control={form.control}
                        name="email_notifications"
                        render={({ field }) => (
                            <div className="flex items-center justify-between p-4 rounded-lg bg-white/5">
                                <div>
                                    <div className="font-medium text-white">Email Notifications</div>
                                    <div className="text-sm text-white/60">Send system notifications via email</div>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input 
                                        type="checkbox" 
                                        className="sr-only peer" 
                                        checked={field.value}
                                        onChange={field.onChange}
                                    />
                                    <div className="w-11 h-6 bg-white/20 peer-focus:ring-2 peer-focus:ring-white/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                                </label>
                            </div>
                        )}
                    />
                </div>
            </div>
        </div>
    );
}
