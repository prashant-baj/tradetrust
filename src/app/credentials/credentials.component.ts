import { Component, OnInit } from '@angular/core';
import { LCService } from './lc.service';
import { CdkTextareaAutosize } from '@angular/cdk/text-field';
import { ClipboardModule } from '@angular/cdk/clipboard';





@Component({
  selector: 'app-credentials',
  templateUrl: './credentials.component.html',
  styleUrls: ['./credentials.component.css']
})
export class CredentialsComponent implements OnInit {

  schema = require('./schema/LC.json'); // Replace with the path to your schema file
  lcData = require('./config/data.json');
  ethrProviders = require('./config/providers.json');
  dids = require('./config/did.json');

  lcIssuerDIDStr: any = "";
  lcApplicantDIDStr: any = "";
  lcVerifierDIDStr: any = "";
  vc: any = "";
  jwtvc: any = "";
  vp: any = "";
  jwtvp: any = "";
  verifiedLC: any = "";


  constructor(private lcService: LCService) { }

  ngOnInit(): void {

    this.lcIssuerDIDStr = JSON.stringify(this.dids.lcIssuerDid, null, 2);
    this.lcApplicantDIDStr = JSON.stringify(this.dids.applicantDid, null, 2);
    this.lcVerifierDIDStr = JSON.stringify(this.dids.verifierDid, null, 2);

    this.lcService.vcObservable.subscribe((vcObject: any) => {
      this.vc = JSON.stringify(vcObject, null, 2)
    });
    this.lcService.jwtvcObservable.subscribe((jwtvcObject: any) => {
      this.jwtvc = jwtvcObject;
    });

    this.lcService.vpObservable.subscribe((vpObject: any) => {
      this.vp = JSON.stringify(vpObject, null, 2)
    });
    this.lcService.jwtvpObservable.subscribe((jwtvpObject: any) => {
      this.jwtvp = jwtvpObject;
    });

    this.lcService.verificationObservable.subscribe((verifiedObject: any) => {
      this.verifiedLC = JSON.stringify(verifiedObject, null, 2);
    });

    //this.lcService.testAll();

  }

  createDID(entityType: string) {
    this.lcService.createDID().then(did => {
      console.log(did);
      if (entityType == 'issuer') {
        this.dids.lcIssuerDid = did;
        this.lcIssuerDIDStr = JSON.stringify(this.dids.lcIssuerDid, null, 2);
        
      }
      if (entityType == 'applicant') {
        this.dids.applicantDid = did;
        this.lcApplicantDIDStr = JSON.stringify(this.dids.applicantDid, null, 2);
      }
      if (entityType == 'verifier') {
        this.dids.verifierDid = did;
        this.lcVerifierDIDStr = JSON.stringify(this.dids.verifierDid, null, 2);
      }
    });
  }

  async createCredential() {
    console.log(this.lcData);
    this.lcService.generateCredential(this.lcData);
  }

  async createPresentation() {
    this.lcService.generatePresentation(this.jwtvc);
  }
  async verifyPresentation() {
    this.lcService.verifyPresentation(this.jwtvp);
  }



}
