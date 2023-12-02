import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import {
  EthrDIDMethod, createCredential,
  JWTService,
  createPresentation,
  getSupportedResolvers, DIDWithKeys, KEY_ALG
} from "@jpmorganchase/onyx-ssi-sdk";

import { VerifiablePresentation, verifyPresentation, VerifyPresentationOptions } from "did-jwt-vc";
import { Resolvable } from 'did-resolver';

const schema = require('./schema/LC.json'); // Replace with the path to your schema file
const lcData = require('./config/data.json');
const ethrProviders = require('./config/providers.json');
const dids = require('./config/did.json');
const Ajv = require('ajv');

const ajv = new Ajv({ allErrors: true });
const validate = ajv.compile(schema);

@Injectable({
  providedIn: 'root'
})
export class LCService {

  public vcObservable = new Subject<any>();
  public jwtvcObservable = new Subject<any>();

  public vpObservable = new Subject<any>();
  public jwtvpObservable = new Subject<any>();

  public verificationObservable = new Subject<any>();


  constructor() {

  }

  createDID(){
    const didEthr = new EthrDIDMethod(ethrProviders.ethrProvider);
    let did:any = "";
    return didEthr.create()
       
  }
  // Function to generate JWT VC
  generateCredential(lcData: any) {
    const valid = validate(lcData);

    if (valid == false) {
      // return null;
      this.vcObservable.next("Invalid input.. VC couldnt be generated");
    }
    console.log('LC data is valid:');
    //console.log(lcData);
    //console.log(ethrProviders.lcIssuerEthrProvider);

    const applicantDid: DIDWithKeys = dids.applicantDid;
    const lcIssuerDid: DIDWithKeys = dids.lcIssuerDid;

    applicantDid.keyPair.algorithm = KEY_ALG.ES256K;
    lcIssuerDid.keyPair.algorithm = KEY_ALG.ES256K;


    const didEthr = new EthrDIDMethod(ethrProviders.ethrProvider);
    const didResolver = getSupportedResolvers([didEthr]);

    didResolver.resolve(lcIssuerDid.did, { accept: 'application/did+json' }).then(idata => {
      const jwtVC = didResolver.resolve(applicantDid.did, { accept: 'application/did+json' }).then(data => {

        console.log("Applicants DID resolved !! ");
  
        const lcDid = didEthr.create().then(res => {
          const additionalParams = {
            id: res.did,
            expirationDate: lcData.expirationDate,
          }
  
          const subjectData = lcData;
  
          const vc = createCredential(
            lcIssuerDid.did, applicantDid.did, subjectData, ["LetterOfCreditCredential"], additionalParams);
  
          console.log("******************** Verifiable Credential of LC *********************");
          console.log(JSON.stringify(vc, null, 2))
          this.vcObservable.next(vc);
  
          const jwtService = new JWTService()
          const jwtVC = jwtService.signVC(lcIssuerDid, vc).then(data => {
            console.log(data)
            this.jwtvcObservable.next(data);
          });  
        });
      }).catch(err => {
        console.error("Applicants DID could not be resolved");
        this.jwtvcObservable.next("");
        alert("Applicants DID could not be resolved");
      });
    }).catch(err => {
      console.error("LC Issuer DID could not be resolved");
      this.jwtvcObservable.next("");
      alert("LC Issuer DID could not be resolved");
    });

    
    //return "jwtVC";


  }


  generatePresentation(vcjwt: any) {
    const applicantDid: DIDWithKeys = dids.applicantDid;
    applicantDid.keyPair.algorithm = KEY_ALG.ES256K;

    const didEthr = new EthrDIDMethod(ethrProviders.ethrProvider);
    const didResolver = getSupportedResolvers([didEthr]);
    didResolver.resolve(applicantDid.did, { accept: 'application/did+json' }).then(data => {
      console.log("Applicants DID resolved !! ");
      const vp = createPresentation(applicantDid.did, [vcjwt]);
      console.log(vp);
      this.vpObservable.next(vp);
      const jwtService = new JWTService();
      jwtService.signVP(applicantDid, vp).then(data => {
        this.jwtvpObservable.next(data);
        console.log(data);
        console.log("Now you can send this VP to Merchant and Advising bank for verification !!");
      });
    }).catch(err => {
      console.error("Applicants DID could not be resolved");
      alert("Applicants DID could not be resolved");
    });

  }

  verifyPresentation(vpjwt: any) {
    try {
      const applicantDid: DIDWithKeys = dids.applicantDid;
      applicantDid.keyPair.algorithm = KEY_ALG.ES256K;
      const didEthr = new EthrDIDMethod(ethrProviders.ethrProvider);
      const didResolver = getSupportedResolvers([didEthr]);
      const resultVp = this.verifyLCPresentationJWT(vpjwt, didResolver)
      resultVp.then(data => {
        console.log(data);
        this.verificationObservable.next(data);
      })

    } catch (error) {
      console.log(error);
    }
  }

  verifyLCPresentationJWT(
    vp: VerifiablePresentation,
    didResolver: Resolvable,
    options?: VerifyPresentationOptions
  ): Promise<any> {
    if (typeof vp === 'string') {
      const verified = verifyPresentation(vp, didResolver, options);
      console.log(verified);
      return verified;
    }
    throw TypeError('Ony JWT supported for Verifiable Presentations')

  }
}
