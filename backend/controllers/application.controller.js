import { Application } from "../models/application.model.js";
import { Job } from "../models/job.model.js";
export const applyJob = async (req,res) => {
    try{
        const userId = req.id;
        const jobId = req.params.id;
        if(!jobId){
            return res.status(400).json({
                message : "Job ID is required",
                success : false
            })
        };
        //check if the user has already applied for the job
        const existingApplication = await Application.findOne({job:jobId,applicant: userId});
        if(existingApplication){
            return res.status(400).json({
                message : "You have already applied for this job",
                success : false
            })
        };
        //check if the jobs exists
        const job = await Job.findById(jobId);
        if(!job){
            return res.status(404).json({
                message : "Job not found",
                success : false
            })
        }
        //create a new application
        const newApplication = await Application.create({
            job : jobId,
            applicant : userId,
        })
        job.applications.push(newApplication._id);
        await job.save();
        
        return res.status(201).json({
            message : "Job applied successfully",
            success : true
        })
    }catch(error){
        console.log(error);
    }
};

export const getAppliedJobs = async (req,res) => {
    try{
        const userId = req.id;
        const application = await Application.find({applicant : userId}).sort({createdAt:-1}).populate({
            path:'job',
            options : {sort:{createdAt:-1}},
            populate:{
                path:'company',
                options : {sort:{createdAt:-1}}
            }
        });//all the jobs which an user has applied, will come here and we want it in ascending order for what we have written createdAt:-1.
        //now path:'job' means in Application model, there is a job field which refers to the Job model
        //add it will give all the fields of the Job Schema Model
        //we want job in sorted order and so we write  options : {sort:{createdAt:-1}}.
        //Inside Job model schema, we have a company field which refers to the Company Schema.
        //We want that also and thus we use nested populate. Again we want it in sorted order.
        if(!application){
            return res.status(404).json({
                message:"No Applications",
                success : false
            })
        };
        return res.status(200).json({
            application,
            success : true
        })
    }catch(error){
        console.log(error);
    }
}

//for admin to see how many have applied
export const getApplicants = async (req,res) => {
    try {
        const jobId = req.params.id;
        const job = await Job.findById(jobId).populate({
            path : 'applications', //spelling should match with field name
            options : {sort:{createdAt:-1}},
            populate:{
                path : 'applicant'
            }
        });
        if(!job){
            return res.status(404).json({
                message : "Job not found",
                success : false
            })
        };

        return res.status(200).json({            
            job,
            success:true
        })
    } catch (error) {
        console.log(error);
    }
} 
export const updateStatus = async (req,res)=>{
    try{
        const {status} = req.body;
        const applicationId = req.params.id;
        if(!status){
            return res.status(400).json({
                message : "Status is required",
                success : false
            }) 
        }
        //find the application by application id
        const application = await Application.findOne({_id:applicationId});
        if(!application){
            return res.status(404).json({
                message : "Application not found",
                success : false
            })
        }
        //Update the status
        application.status = status.toLowerCase();
        await application.save(); //tp save the updated changes

        return res.status(200).json({
            message : "Status is updated successfully",
            success : true
        });
    } catch (error){
        console.log(error);
    }
}