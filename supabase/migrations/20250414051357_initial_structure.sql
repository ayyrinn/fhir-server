create type "public"."gender" as enum ('male', 'female', 'other', 'unknown');

create type "public"."insurance" as enum ('BPJS', 'AIA Financial', 'Allianz Life Indonesia', 'AXA Mandiri', 'BNI Life', 'BRI Life', 'China Life Insurance Indonesia', 'JAGADIRI', 'Kresna Life', 'LIPPO LIFE ASSURANCE', 'Manulife', 'Prudential', 'Sequis Financial', 'Sequis Life', 'Sun Life', 'Zurich Topas Life');

create type "public"."priority" as enum ('routine', 'urgent', 'asap', 'stat');

create type "public"."status" as enum ('registered', 'partial', 'preliminary', 'modified', 'final', 'amended', 'corrected', 'appended', 'cancelled', 'entered-in-error', 'unknown', 'draft', 'active', 'on-hold', 'ended', 'completed', 'revoked', 'available', 'inactive', 'suspended', 'preparation', 'in-progress', 'stopped', 'specimen-in-process');

create table "public"."diagnosticReport" (
    "id" uuid not null default gen_random_uuid(),
    "findings" text,
    "recommendations" text,
    "isAllDoctor" boolean,
    "identifier" jsonb,
    "basedOn" uuid default gen_random_uuid(),
    "status" status not null,
    "effective_dateTime" timestamp without time zone,
    "resultInterpreter" uuid default gen_random_uuid(),
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp without time zone default now()
);


create table "public"."imagingStudy" (
    "identifier" jsonb,
    "status" status,
    "modality" jsonb,
    "subject" uuid not null default gen_random_uuid(),
    "started" timestamp without time zone,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp without time zone default now(),
    "id" uuid not null default gen_random_uuid()
);


create table "public"."location" (
    "id" uuid not null default gen_random_uuid(),
    "status" status,
    "name" text,
    "type" jsonb,
    "location_modality" json,
    "ae_title" text,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp without time zone default now()
);


create table "public"."observation" (
    "partOf" uuid default gen_random_uuid(),
    "status" status,
    "subject" uuid default gen_random_uuid(),
    "effective_dateTime" timestamp without time zone,
    "performer" uuid default gen_random_uuid(),
    "component_valueQuantity" jsonb,
    "componen_code" jsonb,
    "created_at" timestamp with time zone not null default now(),
    "udpated_at" timestamp without time zone default now(),
    "id" uuid not null default gen_random_uuid()
);


create table "public"."patient" (
    "identifier" jsonb,
    "familyName" jsonb,
    "given" jsonb,
    "gender" gender,
    "birthDate" date,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp without time zone default now(),
    "id" uuid not null default gen_random_uuid()
);


create table "public"."practitioner" (
    "id" uuid not null default gen_random_uuid(),
    "practitioner_role" jsonb,
    "optional_1" text,
    "optional_2" text,
    "optional_3" text,
    "active" boolean,
    "name" jsonb,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp without time zone default now()
);


create table "public"."procedure" (
    "id" uuid not null default gen_random_uuid(),
    "identifier" jsonb,
    "basedOn" uuid default gen_random_uuid(),
    "status" status,
    "performedDateTime" timestamp without time zone,
    "performer_function" jsonb,
    "performer_actor" uuid not null default gen_random_uuid(),
    "location" uuid default gen_random_uuid(),
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp without time zone default now()
);


create table "public"."serviceRequest" (
    "id" uuid not null default gen_random_uuid(),
    "modality" jsonb,
    "identifier" jsonb,
    "status" status,
    "code" jsonb,
    "priority" priority,
    "subject" uuid not null default gen_random_uuid(),
    "occurrence_dateTime" timestamp without time zone,
    "requester" uuid default gen_random_uuid(),
    "performer" uuid default gen_random_uuid(),
    "reason" jsonb,
    "insurance" insurance,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp without time zone default now()
);


CREATE UNIQUE INDEX "diagnosticReport_pkey" ON public."diagnosticReport" USING btree (id);

CREATE UNIQUE INDEX "imagingStudy_pkey" ON public."imagingStudy" USING btree (id);

CREATE UNIQUE INDEX location_pkey ON public.location USING btree (id);

CREATE UNIQUE INDEX observation_pkey ON public.observation USING btree (id);

CREATE UNIQUE INDEX patient_pkey ON public.patient USING btree (id);

CREATE UNIQUE INDEX practitioner_pkey ON public.practitioner USING btree (id);

CREATE UNIQUE INDEX procedure_pkey ON public.procedure USING btree (id);

CREATE UNIQUE INDEX "serviceRequest_pkey" ON public."serviceRequest" USING btree (id);

alter table "public"."diagnosticReport" add constraint "diagnosticReport_pkey" PRIMARY KEY using index "diagnosticReport_pkey";

alter table "public"."imagingStudy" add constraint "imagingStudy_pkey" PRIMARY KEY using index "imagingStudy_pkey";

alter table "public"."location" add constraint "location_pkey" PRIMARY KEY using index "location_pkey";

alter table "public"."observation" add constraint "observation_pkey" PRIMARY KEY using index "observation_pkey";

alter table "public"."patient" add constraint "patient_pkey" PRIMARY KEY using index "patient_pkey";

alter table "public"."practitioner" add constraint "practitioner_pkey" PRIMARY KEY using index "practitioner_pkey";

alter table "public"."procedure" add constraint "procedure_pkey" PRIMARY KEY using index "procedure_pkey";

alter table "public"."serviceRequest" add constraint "serviceRequest_pkey" PRIMARY KEY using index "serviceRequest_pkey";

alter table "public"."diagnosticReport" add constraint "diagnosticReport_basedOn_fkey" FOREIGN KEY ("basedOn") REFERENCES "serviceRequest"(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."diagnosticReport" validate constraint "diagnosticReport_basedOn_fkey";

alter table "public"."diagnosticReport" add constraint "diagnosticReport_resultInterpreter_fkey" FOREIGN KEY ("resultInterpreter") REFERENCES practitioner(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."diagnosticReport" validate constraint "diagnosticReport_resultInterpreter_fkey";

alter table "public"."imagingStudy" add constraint "imagingStudy_subject_fkey" FOREIGN KEY (subject) REFERENCES patient(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."imagingStudy" validate constraint "imagingStudy_subject_fkey";

alter table "public"."observation" add constraint "observation_partOf_fkey" FOREIGN KEY ("partOf") REFERENCES "imagingStudy"(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."observation" validate constraint "observation_partOf_fkey";

alter table "public"."observation" add constraint "observation_performer_fkey1" FOREIGN KEY (performer) REFERENCES practitioner(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."observation" validate constraint "observation_performer_fkey1";

alter table "public"."observation" add constraint "observation_subject_fkey" FOREIGN KEY (subject) REFERENCES patient(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."observation" validate constraint "observation_subject_fkey";

alter table "public"."procedure" add constraint "procedure_basedOn_fkey" FOREIGN KEY ("basedOn") REFERENCES "serviceRequest"(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."procedure" validate constraint "procedure_basedOn_fkey";

alter table "public"."procedure" add constraint "procedure_location_fkey" FOREIGN KEY (location) REFERENCES location(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."procedure" validate constraint "procedure_location_fkey";

alter table "public"."procedure" add constraint "procedure_performer_actor_fkey" FOREIGN KEY (performer_actor) REFERENCES practitioner(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."procedure" validate constraint "procedure_performer_actor_fkey";

alter table "public"."serviceRequest" add constraint "serviceRequest_performer_fkey" FOREIGN KEY (performer) REFERENCES practitioner(id) not valid;

alter table "public"."serviceRequest" validate constraint "serviceRequest_performer_fkey";

alter table "public"."serviceRequest" add constraint "serviceRequest_requester_fkey" FOREIGN KEY (requester) REFERENCES practitioner(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."serviceRequest" validate constraint "serviceRequest_requester_fkey";

alter table "public"."serviceRequest" add constraint "serviceRequest_subject_fkey" FOREIGN KEY (subject) REFERENCES patient(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."serviceRequest" validate constraint "serviceRequest_subject_fkey";

grant delete on table "public"."diagnosticReport" to "anon";

grant insert on table "public"."diagnosticReport" to "anon";

grant references on table "public"."diagnosticReport" to "anon";

grant select on table "public"."diagnosticReport" to "anon";

grant trigger on table "public"."diagnosticReport" to "anon";

grant truncate on table "public"."diagnosticReport" to "anon";

grant update on table "public"."diagnosticReport" to "anon";

grant delete on table "public"."diagnosticReport" to "authenticated";

grant insert on table "public"."diagnosticReport" to "authenticated";

grant references on table "public"."diagnosticReport" to "authenticated";

grant select on table "public"."diagnosticReport" to "authenticated";

grant trigger on table "public"."diagnosticReport" to "authenticated";

grant truncate on table "public"."diagnosticReport" to "authenticated";

grant update on table "public"."diagnosticReport" to "authenticated";

grant delete on table "public"."diagnosticReport" to "service_role";

grant insert on table "public"."diagnosticReport" to "service_role";

grant references on table "public"."diagnosticReport" to "service_role";

grant select on table "public"."diagnosticReport" to "service_role";

grant trigger on table "public"."diagnosticReport" to "service_role";

grant truncate on table "public"."diagnosticReport" to "service_role";

grant update on table "public"."diagnosticReport" to "service_role";

grant delete on table "public"."imagingStudy" to "anon";

grant insert on table "public"."imagingStudy" to "anon";

grant references on table "public"."imagingStudy" to "anon";

grant select on table "public"."imagingStudy" to "anon";

grant trigger on table "public"."imagingStudy" to "anon";

grant truncate on table "public"."imagingStudy" to "anon";

grant update on table "public"."imagingStudy" to "anon";

grant delete on table "public"."imagingStudy" to "authenticated";

grant insert on table "public"."imagingStudy" to "authenticated";

grant references on table "public"."imagingStudy" to "authenticated";

grant select on table "public"."imagingStudy" to "authenticated";

grant trigger on table "public"."imagingStudy" to "authenticated";

grant truncate on table "public"."imagingStudy" to "authenticated";

grant update on table "public"."imagingStudy" to "authenticated";

grant delete on table "public"."imagingStudy" to "service_role";

grant insert on table "public"."imagingStudy" to "service_role";

grant references on table "public"."imagingStudy" to "service_role";

grant select on table "public"."imagingStudy" to "service_role";

grant trigger on table "public"."imagingStudy" to "service_role";

grant truncate on table "public"."imagingStudy" to "service_role";

grant update on table "public"."imagingStudy" to "service_role";

grant delete on table "public"."location" to "anon";

grant insert on table "public"."location" to "anon";

grant references on table "public"."location" to "anon";

grant select on table "public"."location" to "anon";

grant trigger on table "public"."location" to "anon";

grant truncate on table "public"."location" to "anon";

grant update on table "public"."location" to "anon";

grant delete on table "public"."location" to "authenticated";

grant insert on table "public"."location" to "authenticated";

grant references on table "public"."location" to "authenticated";

grant select on table "public"."location" to "authenticated";

grant trigger on table "public"."location" to "authenticated";

grant truncate on table "public"."location" to "authenticated";

grant update on table "public"."location" to "authenticated";

grant delete on table "public"."location" to "service_role";

grant insert on table "public"."location" to "service_role";

grant references on table "public"."location" to "service_role";

grant select on table "public"."location" to "service_role";

grant trigger on table "public"."location" to "service_role";

grant truncate on table "public"."location" to "service_role";

grant update on table "public"."location" to "service_role";

grant delete on table "public"."observation" to "anon";

grant insert on table "public"."observation" to "anon";

grant references on table "public"."observation" to "anon";

grant select on table "public"."observation" to "anon";

grant trigger on table "public"."observation" to "anon";

grant truncate on table "public"."observation" to "anon";

grant update on table "public"."observation" to "anon";

grant delete on table "public"."observation" to "authenticated";

grant insert on table "public"."observation" to "authenticated";

grant references on table "public"."observation" to "authenticated";

grant select on table "public"."observation" to "authenticated";

grant trigger on table "public"."observation" to "authenticated";

grant truncate on table "public"."observation" to "authenticated";

grant update on table "public"."observation" to "authenticated";

grant delete on table "public"."observation" to "service_role";

grant insert on table "public"."observation" to "service_role";

grant references on table "public"."observation" to "service_role";

grant select on table "public"."observation" to "service_role";

grant trigger on table "public"."observation" to "service_role";

grant truncate on table "public"."observation" to "service_role";

grant update on table "public"."observation" to "service_role";

grant delete on table "public"."patient" to "anon";

grant insert on table "public"."patient" to "anon";

grant references on table "public"."patient" to "anon";

grant select on table "public"."patient" to "anon";

grant trigger on table "public"."patient" to "anon";

grant truncate on table "public"."patient" to "anon";

grant update on table "public"."patient" to "anon";

grant delete on table "public"."patient" to "authenticated";

grant insert on table "public"."patient" to "authenticated";

grant references on table "public"."patient" to "authenticated";

grant select on table "public"."patient" to "authenticated";

grant trigger on table "public"."patient" to "authenticated";

grant truncate on table "public"."patient" to "authenticated";

grant update on table "public"."patient" to "authenticated";

grant delete on table "public"."patient" to "service_role";

grant insert on table "public"."patient" to "service_role";

grant references on table "public"."patient" to "service_role";

grant select on table "public"."patient" to "service_role";

grant trigger on table "public"."patient" to "service_role";

grant truncate on table "public"."patient" to "service_role";

grant update on table "public"."patient" to "service_role";

grant delete on table "public"."practitioner" to "anon";

grant insert on table "public"."practitioner" to "anon";

grant references on table "public"."practitioner" to "anon";

grant select on table "public"."practitioner" to "anon";

grant trigger on table "public"."practitioner" to "anon";

grant truncate on table "public"."practitioner" to "anon";

grant update on table "public"."practitioner" to "anon";

grant delete on table "public"."practitioner" to "authenticated";

grant insert on table "public"."practitioner" to "authenticated";

grant references on table "public"."practitioner" to "authenticated";

grant select on table "public"."practitioner" to "authenticated";

grant trigger on table "public"."practitioner" to "authenticated";

grant truncate on table "public"."practitioner" to "authenticated";

grant update on table "public"."practitioner" to "authenticated";

grant delete on table "public"."practitioner" to "service_role";

grant insert on table "public"."practitioner" to "service_role";

grant references on table "public"."practitioner" to "service_role";

grant select on table "public"."practitioner" to "service_role";

grant trigger on table "public"."practitioner" to "service_role";

grant truncate on table "public"."practitioner" to "service_role";

grant update on table "public"."practitioner" to "service_role";

grant delete on table "public"."procedure" to "anon";

grant insert on table "public"."procedure" to "anon";

grant references on table "public"."procedure" to "anon";

grant select on table "public"."procedure" to "anon";

grant trigger on table "public"."procedure" to "anon";

grant truncate on table "public"."procedure" to "anon";

grant update on table "public"."procedure" to "anon";

grant delete on table "public"."procedure" to "authenticated";

grant insert on table "public"."procedure" to "authenticated";

grant references on table "public"."procedure" to "authenticated";

grant select on table "public"."procedure" to "authenticated";

grant trigger on table "public"."procedure" to "authenticated";

grant truncate on table "public"."procedure" to "authenticated";

grant update on table "public"."procedure" to "authenticated";

grant delete on table "public"."procedure" to "service_role";

grant insert on table "public"."procedure" to "service_role";

grant references on table "public"."procedure" to "service_role";

grant select on table "public"."procedure" to "service_role";

grant trigger on table "public"."procedure" to "service_role";

grant truncate on table "public"."procedure" to "service_role";

grant update on table "public"."procedure" to "service_role";

grant delete on table "public"."serviceRequest" to "anon";

grant insert on table "public"."serviceRequest" to "anon";

grant references on table "public"."serviceRequest" to "anon";

grant select on table "public"."serviceRequest" to "anon";

grant trigger on table "public"."serviceRequest" to "anon";

grant truncate on table "public"."serviceRequest" to "anon";

grant update on table "public"."serviceRequest" to "anon";

grant delete on table "public"."serviceRequest" to "authenticated";

grant insert on table "public"."serviceRequest" to "authenticated";

grant references on table "public"."serviceRequest" to "authenticated";

grant select on table "public"."serviceRequest" to "authenticated";

grant trigger on table "public"."serviceRequest" to "authenticated";

grant truncate on table "public"."serviceRequest" to "authenticated";

grant update on table "public"."serviceRequest" to "authenticated";

grant delete on table "public"."serviceRequest" to "service_role";

grant insert on table "public"."serviceRequest" to "service_role";

grant references on table "public"."serviceRequest" to "service_role";

grant select on table "public"."serviceRequest" to "service_role";

grant trigger on table "public"."serviceRequest" to "service_role";

grant truncate on table "public"."serviceRequest" to "service_role";

grant update on table "public"."serviceRequest" to "service_role";


