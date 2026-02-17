/**
 * PocketBase Types
 * Mapped from Supabase schema to PocketBase collections
 */

import PocketBase, { RecordService } from 'pocketbase';

export interface BaseRecord {
    id: string;
    created: string;
    updated: string;
    collectionId: string;
    collectionName: string;
    expand?: any;
}

export interface User extends BaseRecord {
    email: string;
    emailVisibility: boolean;
    verified: boolean;
    username: string;
    
    // Profile fields moved to User collection
    first_name: string;
    last_name: string;
    display_name?: string;
    title?: string;
    bio?: string;
    location?: string;
    phone?: string;
    linkedin_url?: string;
    github_url?: string;
    portfolio_url?: string;
    avatar?: string;
    
    // Role/Permissions
    role?: string; // 'admin', 'consultant', etc.
}

export interface Department extends BaseRecord {
    name: string;
    description?: string;
    leader: string; // Relation to users
}

export interface Client extends BaseRecord {
    name: string;
}

export interface Project extends BaseRecord {
    name: string;
    description?: string;
    client?: string; // Relation to clients
    start_date?: string;
    end_date?: string;
    status?: string;
    owner?: string; // Relation to users
    hours_required?: number;
    template_id?: string;
}

export interface Skill extends BaseRecord {
    name: string;
    aliases?: string[]; // JSON
}

export interface ProfileSkill extends BaseRecord {
    user: string; // Relation to users
    skill: string; // Relation to skills
    proficiency?: number;
    years?: number;
}

export interface Education extends BaseRecord {
    user: string; // Relation to users
    institution: string;
    degree_level?: string;
    program?: string;
    start_year?: number;
    end_year?: number;
}

export interface Experience extends BaseRecord {
    user: string; // Relation to users
    org: string;
    role: string;
    description?: string;
    start_date: string;
    end_date?: string;
    type?: string;
}

export interface ProjectMember extends BaseRecord {
    project: string; // Relation to projects
    user: string; // Relation to users
    role?: string;
    hours?: number;
    start_date?: string;
    end_date?: string;
    contribution?: string;
}

export interface ProjectSkill extends BaseRecord {
    project: string; // Relation to projects
    skill: string; // Relation to skills
}

export interface AvailabilityMonth extends BaseRecord {
    user: string; // Relation to users
    month: string;
    hours_available: number;
    hours_committed?: number;
    status?: 'available' | 'busy' | 'partly' | 'unavailable'; // Enum equivalent
    notes?: string;
}

export interface AccessRequest extends BaseRecord {
    email: string;
    name?: string;
    message?: string;
    status: string;
    decided_by?: string; // Relation to users
    decided_at?: string;
}

export interface Invitation extends BaseRecord {
    email: string;
    role?: string;
    invited_by: string; // Relation to users
    token_hash: string;
    expires_at: string;
    accepted_at?: string;
}

export interface ProjectUpdate extends BaseRecord {
    project: string; // Relation to projects
    author: string; // Relation to users
    title?: string;
    body?: string;
}

export interface ProfileDepartment extends BaseRecord {
    user: string; // Relation to users
    department: string; // Relation to departments
    is_primary: boolean;
    role?: string;
    since?: string;
}

export interface Compensation extends BaseRecord {
    user: string; // Relation to users
    hourly_rate: number;
    currency?: string;
    valid_from?: string;
}

export interface ProjectInterest extends BaseRecord {
    project: string;
    profile: string;
    message?: string;
}

export interface ProjectDepartmentHour extends BaseRecord {
    project: string;
    department: string;
    hours_required: number;
}

export interface TypedPocketBase extends PocketBase {
    collection(idOrName: string): RecordService;
    collection(idOrName: 'users'): RecordService<User>;
    collection(idOrName: 'departments'): RecordService<Department>;
    collection(idOrName: 'clients'): RecordService<Client>;
    collection(idOrName: 'projects'): RecordService<Project>;
    collection(idOrName: 'skills'): RecordService<Skill>;
    collection(idOrName: 'profile_skills'): RecordService<ProfileSkill>;
    collection(idOrName: 'educations'): RecordService<Education>;
    collection(idOrName: 'experiences'): RecordService<Experience>;
    collection(idOrName: 'project_members'): RecordService<ProjectMember>;
    collection(idOrName: 'project_skills'): RecordService<ProjectSkill>;
    collection(idOrName: 'availability_months'): RecordService<AvailabilityMonth>;
    collection(idOrName: 'access_requests'): RecordService<AccessRequest>;
    collection(idOrName: 'invitations'): RecordService<Invitation>;
    collection(idOrName: 'project_updates'): RecordService<ProjectUpdate>;
    collection(idOrName: 'profile_departments'): RecordService<ProfileDepartment>;
    collection(idOrName: 'compensation'): RecordService<Compensation>;
    collection(idOrName: 'project_interest'): RecordService<ProjectInterest>;
    collection(idOrName: 'project_department_hours'): RecordService<ProjectDepartmentHour>;
}
